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
    for(var i = 0; i < set.length-1; i++) {
        this.inputs[i].setOutput(set[i]);
    }
};

NetworkTraining.prototype.initializeWeights = function() {
    for(var i = 0; i < this.dendrites.length; i++)
        this.dendrites[i].setWeight((Math.random() - 0.5) / 10);
};

NetworkTraining.prototype.getOutputs = function() {
    var outputs = [];
    for(var i = 0; i < this.outputs.length; i++) {
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
NetworkTraining.prototype.backwardsPropagation = function(error, outputs, targets, new_weights) {
    // Outputs
    var output_axions = this.getOutputAxions();
    var e_tot__weight_k,
        etot__out_i, 
        etot__net_i, 
        delta_i,
        delta_weight,
        etot_out_h,
        axion_error_sum = {};

    for(var i = 0; i < output_axions.length; i++) {
        // Error contribution in regards of the current output-axion
        etot__out_i = -(target[i] - outputs[i]);

        // Error contribution in regards of the sigmoid function
        etot__net_i = outputs[i] * (1 - outputs[i]);

        // Error contribution for all incomming weighted dendrites
        delta_i = etot__out_i * etot__net_i;

        var dendrites = output_axions[i].getDendrites();
        for(var k = 0; k < dendrites.length; k++) {
            // Total error contribution of a single dendrite
            e_tot__weight_k = dendrites[i].getOutput() * delta_i;
            // Add up the error a single axion generates for next recursion
            axion_error_sum[dendrites[i].getAxion().getIndex()] += e_tot__weight_k
            new_weights[dendrites[i].getIndex()] =  dendrites[i].getWeight() - this.rate * e_tot__weight_k;
        } 
    }


    var axions = {};
    for(var i = 0; i < output_axions.length; i++) {
        var dendrites = output_axions[i].getNeuron().getDendrites();
        for(var k = 0; k < dendrites.length; k++) {
            var axion = dendrites[k].getAxion();

            if(typeof axions[neuron.getIndex()] != 'undefined')
                continue;

            axions[neuron.getIndex()] = axion;
        }
    }

    // Hidden Layers
    var propagate = function(axions, axion_error_sum, new_weights) {
        var etot__weight_hk,
            etot__out_hi, 
            etot__net_hi, 
            output_hi,
            delta_hi,
            delta_weight,
            etot_out_h,
            axion_error_sum = {};
            
        for(var i = 0; i < axions.lenth; i++) {
            etot__out_hi = axion_error_sum[axions[i].getIndex()];

            // Error contribution in regards of the sigmoid function
            output_hi = axions[i].getOutput();
            etot__net_hi = output_hi * (1 - output_hi);

            // Error contribution for all incomming weighted dendrites
            delta_hi = etot__out_hi * etot__net_hi;

            var dendrites = output_axions[i].getDendrites();
            for(var k = 0; k < dendrites.length; k++) {
                // Error contribution based on the weight of the dendrite
                etot__weight_hk = dendrites[i].getOutput() * delta_hi;
                axion_error_sum[dendrites[i].getAxion().getIndex()] += e_tot__weight_k
                new_weights[dendrites[i].getIndex()] =  dendrites[i].getWeight() - this.rate * e_tot__weight_k;
            } 
        }

        var next_axions = {};
        for(var i = 0; i < axions.length; i++) {
            var dendrites = axions[i].getNeuron().getDendrites();
            for(var k = 0; k < dendrites.length; k++) {
                var axion = dendrites[k].getAxion();

                if(typeof axions[neuron.getIndex()] != 'undefined')
                    continue;

                next_axions[neuron.getIndex()] = axion;
            }
        }
    };
    propagate(axions, axion_error_sum, new_weights)
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

            self.backwardsPropagation(error, outputs);

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