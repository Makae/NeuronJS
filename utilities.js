var Utilities = {
    getNumberArray : function(value, num) {
        return Array.apply(null, Array(num)).map(Number.prototype.valueOf, value);
    }
};

Utilities.Thresholds = {
    Sigmoid : function() {
        return function(x) {
            return 1 / (1 + Math.pow(Math.E, -x));
        }
    },

    Identity : function(x) {
        return x;
    },

    Linear : function(min, max) {
        return function(x) {
            return Math.max(min, Math.max(max, x));
        }
    }

};