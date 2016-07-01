function NetworkTraining(input_neurons, dendrites, output_axion, rate) {
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
}

NetworkTraining.prototype.getTargetValue = function(set) {
    return set[set.length -1];
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

NetworkTraining.prototype.calculateError = function(output, target, weight) {
    return this.rate * (target - output) * weight;
};

NetworkTraining.prototype.pause = function() {
    this.paused = true;
};

NetworkTraining.prototype.unpause = function() {
    this.paused = false;
};

NetworkTraining.prototype.train = function(training_set, admissible, step_speed) {
    var self = this;
    var result, target, tupel, expectation, delta_weights;
    var admissible = admissible || 0.02;
    var error = 1000; 
    var ctr = 0;
    var training_length = training_set.length - 1;

    this.initializeWeights();
    var step = function() {
        if(error <= admissible)
            return true;

        ctr++;
        delta_weights = Utilities.getNumberArray(0, self.dendrites.length);
        for(var i = 0; i < training_set.length; i++) {
            tupel  = training_set[i];
            self.setInputValues(tupel);

            target = self.getTargetValue(tupel);
            output = self.getOutput();

            self._trigger('training_tupel', {
                'set_idx' : i,
                'tupel' : tupel,
                'target' : target,
                'output' : outputs
            });
            // debugger;
            for(var d = 0; d < dendrites.length; d++) {
                delta_weights[d] += Math.pow(self.calculateError(output, target, dendrites[d].getWeight(), 2) / 2;
            }
            
            for(var w = 0; w < dendrites.length; w++) {
                dendrites[w].addWeight(delta_weights[w]);
            }
            self._trigger('training_tupel_end', {
                'set_idx' : i
            });
        }

        error = 0;
        for(var i = 0; i < training_set.length; i++) {
            tupel  = training_set[i];
            self.setInputValues(tupel);
            error += Math.abs(self.getTargetValue(tupel) - self.getOutput());
        }

        self._trigger('loop', {
            'error' : error,
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