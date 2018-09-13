function NetworkVisualizer(container, neuronal_network) {
    this.container = container;
    this.nn        = neuronal_network;
    this.data      = {};
    this.options   = {
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
    };;

    this.nodes = null;
    this.edges = null;

    this.vis_network = null;
}

NetworkVisualizer.prototype.init = function() {
    var nw_data = this.extractNetworkData();
    this.vis_network = new vis.Network(this.container, nw_data, this.options);
};

NetworkVisualizer.prototype.updateNetwork = function() {
    var nw_data = this.extractNetworkData();
    this.vis_network.setData(nw_data);
    console.log("Node 3: " + nw_data.nodes[3].value);
    console.log("Node 4: " + nw_data.nodes[4].value);
    this.vis_network.redraw();
};

NetworkVisualizer.prototype.extractNetworkData = function() {
    var nodes = [];
    var edges = [];

    var neurons, output_axions;
    output_neurons = this.nn.getOutputNeurons();
    for(var i = 0; i < output_neurons.length; i++) {
        nodes.push({
            id: output_neurons[i].getIndex(),
            value: output_neurons[i].getAxion().getOutput(),
            label:  output_neurons[i].getAxion().getOutput(),
            color: '#d4af90'
        });
    }

    var nw_data = this._recursiveExtractNetworkData(output_neurons);

    // Populate our network object.
    var data = {
        nodes: nodes.concat(nw_data.nodes),
        edges: nw_data.edges
    };

    return data;

};


NetworkVisualizer.prototype._recursiveExtractNetworkData = function(prev_neurons) {
    var current_neurons = [];
    var added_neurons = [];
    var nodes = [];
    var edges = [];
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

            // Only add if not already added, check via Index
            if(added_neurons.indexOf(neuron.getIndex()) == -1) {
                var neuron_label = is_input ? neuron.getAxion().getOutput() : neuron.getIndex();
                nodes.push({
                    id:    neuron.getIndex(),
                    value: neuron_label,
                    label: neuron_label,
                    color: color
                });
                
                added_neurons.push(neuron.getIndex());

                if(neuron.hasDendrites())
                    current_neurons.push(neuron);
            }


            var weight = dendrite.getWeight();
            edges.push({
                from:  neuron.getIndex(), 
                to:    prev_neuron.getIndex(), 
                value: weight,
                label: Math.floor(100 * weight) / 100,
                title: 'Dendrite (' + dendrite.getIndex() +') | w:' + dendrite.getWeight(),
                color: color
            });
        }
    }

    if(current_neurons.length) {
        var recursive_data = this._recursiveExtractNetworkData(current_neurons);
        nodes = nodes.concat(recursive_data.nodes);
        edges = edges.concat(recursive_data.edges);
    }

    return {
        nodes: nodes,
        edges: edges
    };

};