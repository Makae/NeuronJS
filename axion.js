var Axion = (function() {
    
    var AXION_CTR = 0;

    function Axion(neuron, threshold_function) {
        this.axion_id = AXION_CTR++;
        this.neuron = neuron;
        this.threshold_function = threshold_function;
    }

    return Axion;
})();

Axion.prototype.getIndex = function() {
    return this.axion_id;
};

Axion.prototype.setNeuron = function(neuron) {
    this.neuron = neuron;
};

Axion.prototype.getNeuron = function() {
    return this.neuron;
};

Axion.prototype.getOutput = function(dendrite) {
    return this.threshold_function(this.neuron.getOutput());
};

function InputAxion(value) {
    Axion.apply(this, []);
    this.value = value;
}

InputAxion.prototype = Object.create(Axion.prototype)

InputAxion.prototype.getOutput = function() {
    return this.value;
};

InputAxion.prototype.setOutput = function(value) {
    this.value = value;
    return this;
};