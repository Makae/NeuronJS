function NetworkVisualizer(container, neuronal_network) {
    this.container = container;
    this.nn        = neuronal_network;
    this.data      = {};
    this.options   = {};

    this.nodes = null;
    this.edges = null;

    this.vis_network = null;
}

NetworkVisualizer.prototype.init = function() {
    if(this.initialized)
        return;
    this.rebuildNetwork();


    this.initialized = true;
};

NetworkVisualizer.prototype.show = function() {
    this.init();
    this.vis_network = new vis.Network(this.container, this.data, this.options);
};

NetworkVisualizer.prototype.updateNetwork = function() {

};

NetworkVisualizer.prototype.rebuildNetwork = function() {
    this.nodes = [];
    this.edges = [];

    var neurons, output_axions;
    output_neurons = this.nn.getOutputNeurons();
    for(var i = 0; i < output_neurons.length; i++)
        this.nodes.push({
            id: output_neurons[i].getIndex(),
            value: output_neurons[i].getOutput(),
            label:  output_neurons[i].getOutput(),
            color: '#d4af90'
        });

    this._recursiveBuildNetwork(output_neurons);

    // Instantiate our network object.
    this.data = {
        nodes: this.nodes,
        edges: this.edges
    };

    this.options = {
        nodes: {
          shape: 'dot',
          scaling:{
            label: {
              min:8,
              max:20
            }
          }
        },
        edges: {
            arrows: 'to'
        }
    };

};


NetworkVisualizer.prototype._recursiveBuildNetwork = function(prev_neurons, existing_neurons) {
    var current_neurons = [];
    var added_neurons = [];
    var prev_neuron, 
        dendrites, 
        dendrite, 
        neuron, 
        is_input;

    for(var i = 0; i < prev_neurons.length; i++) {
        prev_neuron = prev_neurons[i];
        dendrites = prev_neuron.getDendrites();

        for(var k = 0; k < dendrites.length; k++) {
            dendrite = dendrites[k];
            neuron   = dendrite.getAxion().getNeuron();
            is_input = dendrite.getAxion() instanceof InputAxion;

            color = is_input ? '#93d490' : '#90b5d4';

            if(added_neurons.indexOf(neuron.getIndex()) == -1) {
                this.nodes.push({
                    id:    neuron.getIndex(),
                    value: neuron.getIndex(),
                    label: neuron.getIndex(),
                    color: color
                });
                
                added_neurons.push(neuron.getIndex());

                if(neuron.hasDendrites())
                    current_neurons.push(neuron);
            }


            this.edges.push({
                from:  neuron.getIndex(), 
                to:    prev_neuron.getIndex(), 
                value: dendrite.getWeight(),
                title: 'Dendrite (' + dendrite.getIndex() +') | w:' + dendrite.getWeight(),
                color: color
            });
        }
    }

    if(current_neurons.length)
        this._recursiveBuildNetwork(current_neurons);

};