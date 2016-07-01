// Binary A xor B

var training_set = [
	[1, 1, 0],
	[0, 0, 0],
	[0, 1, 1],
	[1, 0, 1],
];

var threshold_function = function(input) {
	return input;
};

var input_axions = [
	new InputAxion(0),
	new InputAxion(0),
];

var inputs = [
	(new Neuron()).setAxion(input_axions[0]),
	(new Neuron()).setAxion(input_axions[1]),
];

var network = new NeuronalNetwork(inputs, threshold_function);
network.addHiddenLayer(4);
network.addHiddenLayer(1);

var inputs = input_axions;
var output = network.getOutputNeuron().getAxion();
var dendrites = network.getDendrites();
var learn_rate = 0.3;
debugger;

train(inputs, dendrites, output, training_set, learn_rate);




/*

dA = dAlpha, dB = dBeta, dK = dKappa ect.

-iAlpha..\-dA-neuronA---axionA\
		  dG /				   dK
		   \/					\_neuronB---axionC-->result
	       /\                   /
          dB \                 dZ
-iBeta.../-dD-neuronB---axionB/

 
  
*/

/*
var iAlpha = new InputAxion(0);
var iBeta  = new InputAxion(0);
var iGamma = new InputAxion(0);
var iDelta = new InputAxion(0);

var neuronA  = new Neuron();
var neuronB  = new Neuron();
var neuronC  = new Neuron();

var dAlpha = new Dendrite(iAlpha, 0.25);
var dBeta  = new Dendrite(iBeta, 1);
var dGamma = new Dendrite(iAlpha, 1.45);
var dDelta = new Dendrite(iBeta, 0.45);

var axionA = new Axion(neuronA, threshold_function);
var axionB = new Axion(neuronB, threshold_function);

var dKappa = new Dendrite(axionA, threshold_function);
var dZeta  = new Dendrite(axionB, threshold_function);

var axionC = new Axion(neuronC, threshold_function);


neuronA.setAxion(axionA);
neuronA.addDendrite(dAlpha);
neuronA.addDendrite(dBeta);

neuronB.setAxion(axionB);
neuronB.addDendrite(dGamma);
neuronB.addDendrite(dDelta);

neuronC.setAxion(axionC);
neuronC.addDendrite(dKappa);
neuronC.addDendrite(dZeta);


var inputs = [iAlpha, iBeta];
var output = axionC;
var dendrites = [dAlpha, dBeta, dGamma, dDelta];
var learn_rate = 0.3;

train(inputs, dendrites, output, training_set, learn_rate);
*/