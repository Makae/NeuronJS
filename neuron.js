var Neuron = (function() {
    
    var NEURON_CTR = 0;

    function Neuron(axion, dendrites) {
        this.neuron_id = NEURON_CTR++;

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
    return value;
};

Neuron.prototype.addDendrite = function(dendrite) {
    this.dendrites.push(dendrite);
    return this;
};

Neuron.prototype.setAxion = function(axion) {
    this.axion = axion;
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