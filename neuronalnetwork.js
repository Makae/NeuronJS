function NeuronalNetwork(input, threshold_function) {
    this.layers = [inputs];
    this.threshold_function = threshold_function;
}

NeuronalNetwork.prototype.addLayer = function(num_neurons) {
    var layer = [];

    for(var i = 0; i < num_neurons; i++) {
        layer.push(this.createNeuron(this.layers.length))
    }
    this.layers.push(layer);
};

NeuronalNetwork.prototype.createNeuron = function(layer) {
    var neuron = new Neuron();
    var axion  = new Axion(neuron, this.threshold_function);
    neuron.setAxion(axion);
    var dendrites = this.newLayerDendrites(layer - 1);
    for(var i = 0; i < dendrites.length; i++) {
        neuron.addDendrite(dendrites[i]);
    }

    return neuron;
};


NeuronalNetwork.prototype.newLayerDendrites = function(layer) {
    var neurons = this.layers[layer];
    var dendrites = [];
    for(var i = 0; i < neurons.length; i++)
        dendrites.push(new Dendrite(neurons[i].getAxion(), Math.random()));
    return dendrites;
};

NeuronalNetwork.prototype.getDendrites = function() {
    var dendrites = [];
    for(var k = 0; k < this.layers.length; k++) {
        for(var i = 0; i < this.layers[k].length; i++) {
            dendrites = dendrites.concat(this.layers[k][i].getDendrites());
        }
    }
    return dendrites;
};

NeuronalNetwork.prototype.getOutputNeurons = function() {
    return this.getLayer(this.numLayers() - 1);
};

NeuronalNetwork.prototype.getLayers = function(index) {
    return this.layers;
};

NeuronalNetwork.prototype.getLayer = function(index) {
    return this.layers[index];
};

NeuronalNetwork.prototype.numLayers = function(index) {
    return this.layers.length;
};