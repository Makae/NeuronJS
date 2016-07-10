function NetworkTraining(input_neurons, dendrites, output_axions, rate) {
    this.inputs = input_neurons;
    this.dendrites = dendrites;
    this.outputs = output_axions;
    this.rate = rate;
    this.event_listeners = {};
    this.paused = false;
}

NetworkTraining.prototype.addEventListener = function(name, fn) {
    this.event_listeners[name] = fn;
}

NetworkTraining.prototype._trigger = function(name, data) {
    if(typeof this.event_listeners[name] == 'function') {
        data = data || {};
        data.training = this;
        this.event_listeners[name](data);
    }
};

NetworkTraining.prototype.getInputNeurons = function() {
    return this.inputs;
};

NetworkTraining.prototype.getDendrites = function() {
    return this.dendrites;
};

NetworkTraining.prototype.getOutputAxions = function() {
    return this.outputs;
};

NetworkTraining.prototype.setInputValues = function(set) {
    for(var i = 0; i < set.length-1; i++)
        this.inputs[i].setOutput(set[i]);
};

NetworkTraining.prototype.initializeWeights = function() {
    for(var i = 0; i < this.dendrites.length; i++)
        this.dendrites[i].setWeight((Math.random() - 0.5) / 10);
};

NetworkTraining.prototype.getOutputs = function() {
    var outputs = [];
    for(var i = 0; i < this.outputs.length; i++)
        outputs.push(this.outputs[i].getOutput());
    return outputs;
};

NetworkTraining.prototype.calculateTotalError = function(targets, outputs) {
    var error = 0;
    for(var i = 0; i < outputs.length; i++)
        error += this.calculateError(targets[i], outputs[i]);
    return error;
};

/**
 * Calculates error for Backpropagation
 * 
 * The coefficient 0.5 is used to cancel out the prefix when
 * calculating the derviative
 */
NetworkTraining.prototype.calculateError = function(alpha, beta) {
    return (1 / 2) * Math.pow(alpha - beta, 2);
};

NetworkTraining.prototype.pause = function() {
    this.paused = true;
};

NetworkTraining.prototype.unpause = function() {
    this.paused = false;
};


/**
 * For more Informations check:
 * https://mattmazur.com/2015/03/17/a-step-by-step-backpropagation-example/
 */
NetworkTraining.prototype.backwardPropagation = function(error, output_axions, targets) {
    var axion_error_sum = {};
    // If we precalculate the output axion error we can use a generic propagation function
    // for training the network. A lot of code looks the same
    for(var i = 0; i < output_axions.length; i++) {
        var o_axion = output_axions[i];
        // Error contribution in regards of the current output axion
        axion_error_sum[o_axion.getIndex()] = -(target[i] - o_axion.getOutput())
    }
    var new_weights = this._recursiveBackwardPropagation(output_axions, axion_error_sum);
};

NetworkTraining.prototype._recursiveBackwardPropagation = function(axions, axion_error_sum, new_weights) {
    new_weights = new_weights || {};

    // Read as "Derivative of E_total by the weight k"
    var etot__weight_k,
        etot__out_i, 
        etot__net_i, 
        output_hi,
        delta_hi,
        delta_weight,
        etot_out_h;
        
    for(var i = 0; i < axions.length; i++) {
        etot__out_i = axion_error_sum[axions[i].getIndex()];

        // Error contribution in regards of the sigmoid function
        output_hi = axions[i].getOutput();
        etot__net_i = output_hi * (1 - output_hi);

        // Error contribution for all incomming weighted dendrites
        delta_hi = etot__out_i * etot__net_i;

        var dendrites = output_axions[i].getDendrites();
        for(var k = 0; k < dendrites.length; k++) {
            // Total error contribution of a single dendrite
            e_tot__weight_k = dendrites[i].getOutput() * delta_i;
            // Add up the error a single axion generates for next recursion
            axion_error_sum[dendrites[i].getAxion().getIndex()] += e_tot__weight_k
            new_weights[dendrites[i].getIndex()] =  dendrites[i].getWeight() - this.rate * e_tot__weight_k;
        } 
    }

    var next_axions = {};
    for(var i = 0; i < axions.length; i++) {
        var dendrites = axions[i].getNeuron().getDendrites();
        for(var k = 0; k < dendrites.length; k++) {
            var axion = dendrites[k].getAxion();

            next_axions[neuron.getIndex()] = axion;
        }
    }

    if(next_axions.length)
        return new_weights;

    return this._recursiveBackwardPropagation(axions, axion_error_sum, new_weights);
};

NetworkTraining.prototype.train = function(training_set, admissible, step_speed) {
    var self = this;
    var result, targets, tupel, expectation, delta_weights, error;
    var admissible = admissible || 0.02;
    var total_error = 1000; 
    var ctr = 0;

    this.initializeWeights();
    var step = function() {
        if(total_error <= admissible)
            return true;

        ctr++;
        delta_weights = Utilities.getNumberArray(0, self.dendrites.length);
        for(var i = 0; i < training_set.length; i++) {
            tupel  = training_set[i];
            self.setInputValues(tupel[0]);

            targets = tupel[1];
            outputs = self.getOutputs();

            // Forward Pass
            error = self.getError(targets, outputs);

            self.backwardPropagation(error, self.getOutputAxions(), targets);

            self._trigger('training_tupel', {
                'set_idx' : i,
                'tupel' : tupel,
                'targets' : targets,
                'outputs' : outputs
            });



            self._trigger('training_tupel_end', {
                'set_idx' : i
            });
        }

        self._trigger('loop', {
            'error' : total_error,
            'loop_idx' : ctr,
            'delta_weights' : delta_weights
        });

        return false;
    };

    this._execute(step, step_speed);
};

NetworkTraining.prototype._execute = function(run, step_speed) {
    var self = this;
    if(step_speed !== false) {
        var interval = window.setInterval(function() {
            if(self.paused)
                return;

            if(!run())
                return;

            window.clearInterval(interval);
            self._trigger('finish');
        
        }, step_speed);
    } else {
        while(!run());
        self._trigger('finish');
    }
};