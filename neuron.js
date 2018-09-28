var Neuron = (function() {
    
    var NEURON_CTR = 0;

    function Neuron(bias, axion, dendrites) {
        this.neuron_id = NEURON_CTR++;

        this.bias = bias || 0;
        this.dendrites = dendrites || [];
        this.axion = axion ||null;
    }

    return Neuron;
})();

Neuron.prototype.getIndex = function() {
    return this.neuron_id;
};

Neuron.prototype.getDendriteOutputSum = function() {
    var value = 0;
    for(var i = 0; i<this.dendrites.length; i++)
        value += this.dendrites[i].getOutput();
    return value + this.bias;
};

Neuron.prototype.addDendrite = function(dendrite) {
    this.dendrites.push(dendrite);
    return this;
};

Neuron.prototype.setBias = function(bias) {
    this.bias = bias;
};

Neuron.prototype.setAxion = function(axion) {
    this.axion = axion;
    this.axion.setNeuron(this);

    return this;
};

Neuron.prototype.getOutput = function() {
    return this.getDendriteOutputSum();
};

Neuron.prototype.getAxion = function() {
    return this.axion;
};

Neuron.prototype.getDendrites = function() {
    return this.dendrites;
};

Neuron.prototype.hasDendrites = function() {
    return this.dendrites.length > 0;
};