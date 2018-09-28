function NetworkTraining(network, rate) {
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
    return this.network.getInputNeurons();
};

NetworkTraining.prototype.getDendrites = function() {
    return this.network.getDendrites();
};

NetworkTraining.prototype.getOutputAxions = function() {
    return this.network.getOutputAxions();
};

NetworkTraining.prototype.setInputValues = function(set) {
    for(var i = 0; i < set.length; i++) {
        this.inputs[i].setOutput(set[i]);
    }
};

NetworkTraining.prototype.initializeWeights = function() {
    if(NJS_TEST_MODUS) {
        var weight;
        var dendrites = this.getDendrites();
        for(var i = 0; i < dendrites.length; i++) {
            var z = Math.floor((Math.random() * 10));
             // 0.111, 0.222 ... 0.888
            weight = ("" + z + z + z) / 1000;
            dendrites[i].setWeight(weight);
        }
        return; 
    }
    for(var i = 0; i < dendrites.length; i++) {
        dendrites[i].setWeight((Math.random()/* - 0.5 */) / 10);
    }
};

NetworkTraining.prototype.getOutputValues = function() {
    var output_values = [];
    var output_axions = this.getOutputAxions();
    for(var i = 0; i < output_axions.length; i++)
        output_values.push(output_axions[i].getOutput());
    return output_values;
};

NetworkTraining.prototype.calculateMultivalueError = function(existing_errors, target_values, output_values) {
    for(var i = 0; i < output_values.length; i++) {
        existing_errors[i] += this.calculateError(target_values[i], output_values[i]);
    }
    return existing_errors;
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
NetworkTraining.prototype.backwardPropagation = function(output_errors, layer_idx) {
    var layer_neurons = this.network.getLayer(layer_idx);
    var previous_neurons = layer_idx > 0 ? this.network.getLayer(layer_idx - 1) : null;
    /*
        1. For each neuron in layer calculate the partial error of it's previous
           predecessor.
        2. Store this partial value in an error sum
    */
    var previous_layer_errors = {};
    var previous_dendrite_list = {};
    for(var i = 0; i < layer_neurons.length; i++) {
        var neuron = layer_neurons[i];
        var neuron_error = output_errors[i];
        var dendrites = neuron.getDendrites();
        for(var n = 0; n < dendrites.length; n++) {
            previous_layer_errors[dendrites[n].getAxion().getNeuron().getIndex()] += neuron_error * dendrites[n].getWeight();
        }
    }
    
    this.adjustWeights(previous_layer_errors);
};


NetworkTraining.prototype._recursiveBackwardPropagation = function(axions, axion_error_sum, new_weights) {
    new_weights = new_weights || {};
    var next_axions = [];

    // Read as "Derivative of E_total by the weight k"
    var etot__weight_k,
        etot__out_i, 
        etot__net_i, 
        output_hi,
        delta_hi,
        delta_weight,
        etot_out_h,
        dendrites,
        axion;
        
    for(var i = 0; i < axions.length; i++) {
        etot__out_i = axion_error_sum[axions[i].getIndex()];

        // Error contribution in regards of the sigmoid function
        output_hi = axions[i].getOutput();
        etot__net_i = output_hi * (1 - output_hi);

        // Error contribution for all incomming weighted dendrites
        delta_hi = etot__out_i * etot__net_i;
        // Get Dendrites of current Axion
        // -D-(N)-A---D1
        // -D-/     \-D2
        dendrites = axions[i].getNeuron().getDendrites();
        for(var k = 0; k < dendrites.length; k++) {
            dendrite = dendrites[i];
            axion = dendrite.getAxion();
            // Total error contribution of a single dendrite
            e_tot__weight_k = dendrite.getOutput() * delta_hi;
            // Add up the error a single axion generates for next recursion
            axion_error_sum[axion.getIndex()] += e_tot__weight_k
            new_weights[dendrite.getIndex()] =  dendrites[i].getWeight() - this.rate * e_tot__weight_k;
        
            // Prevent adding an axion twice by using it's index
            if(next_axions.indexOf(axion) === -1) {
                next_axions.push(dendrites[k].getAxion());
            }
        } 
    }

    if(next_axions.length === 0)
        return new_weights;

    return this._recursiveBackwardPropagation(next_axions, axion_error_sum, new_weights);
};

NetworkTraining.prototype.adjustWeights = function(dendrites, new_weights) {
    for(var i = 0; i < dendrites.length; i++) {
        var dendrite_idx = dendrites[i].getIndex();
        if(isNaN(new_weights[dendrite_idx]) || typeof new_weights[dendrite_idx] === 'undefined') {
            continue;
        }
        this.dendrites[dendrite_idx].setWeight(new_weights[dendrite_idx]);
    }
};

NetworkTraining.prototype.train = function(training_set, admissible, step_speed) {
    var self = this;
    var result, targets, tupel, expectation, delta_weights, error;
    var admissible = admissible || 0.02;
    var ctr = 0;
    var step_speed = step_speed === false ? false : step_speed;

    self.initializeWeights();

    var step = function() {

        ctr++;
        node_errors = Utilities.getNumberArray(0, self.dendrites.length);
        error = 0;
        for(var i = 0; i < training_set.length; i++) {
            tupel  = training_set[i];
            self.setInputValues(tupel[0]);
            self._trigger('after_input_change', {
                'set_idx' : i,
                'tupel' : tupel
            });
            target_values = tupel[1];
            
            // Forward Pass (reset the weights)
            output_values = self.getOutputValues();
            self._trigger('after_fwd_pass', {
                'set_idx' : i,
                'tupel' : tupel,
                'target_values' : target_values,
                'output_values' : output_values
            });
            node_errors = self.calculateMultivalueError(node_errors, target_values, output_values);
        }

        for(var f in node_errors) {
            error += node_errors[f];
        }
        self._trigger('after_error_calculation', {
            'error' : error,
            'loop_idx' : ctr,
            'node_errors' : node_errors
        });

        if(-admissible <= error && error <= admissible) {
            return true;
        }
        self.backwardPropagation(node_errors, this.network.numLayers() - 1);

        return false;
    };

    self._execute(step, step_speed);
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