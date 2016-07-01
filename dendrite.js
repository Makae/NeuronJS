var Dendrite = (function() {
	
	var DENDRITE_CTR = 0;

	function Dendrite(axion, weight) {
		this.dendrite_id = DENDRITE_CTR++;

		this.axion = axion;
		this.weight = weight;
	}

	return Dendrite;
})();

Dendrite.prototype.getOutput = function() {
	return this.axion.getOutput() * this.weight;
};

Dendrite.prototype.setWeight = function(weight) {
	this.weight = weight;
	return this;
};

Dendrite.prototype.getWeight = function() {
	return this.weight;
};
