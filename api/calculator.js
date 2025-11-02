// api/calculator.js - Public version (GitHub-এ upload করবেন)
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        try {
            const { expression, function: func, value, type } = req.body;
            let result;

            if (type === 'advanced' && process.env.ADVANCED_LOGIC) {
                // Use hidden advanced logic from environment variable
                result = executeHiddenLogic(expression, process.env.ADVANCED_LOGIC);
            } else if (type === 'scientific' && process.env.SCIENTIFIC_LOGIC) {
                // Use hidden scientific logic
                result = executeScientificLogic(func, value, process.env.SCIENTIFIC_LOGIC);
            } else {
                // Fallback to basic public logic
                result = evaluateBasic(expression, func, value);
            }

            res.status(200).json({
                success: true,
                result: result.toString()
            });
        } catch (error) {
            res.status(200).json({
                success: false,
                error: error.message
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
};

// Basic public functions
function evaluateBasic(expression, func, value) {
    if (expression) {
        const sanitizedExpr = expression
            .replace(/×/g, '*')
            .replace(/Math\.PI/g, Math.PI)
            .replace(/Math\.E/g, Math.E)
            .replace(/%/g, '/100')
            .replace(/\*\*/g, '**');
        
        try {
            const result = eval(sanitizedExpr);
            if (!isFinite(result)) throw new Error('Math Error');
            return formatResult(result);
        } catch (error) {
            throw new Error('Calculation Error');
        }
    } else if (func && value !== undefined) {
        // Basic scientific functions (public)
        switch(func) {
            case 'sin': return Math.sin(value * Math.PI / 180);
            case 'cos': return Math.cos(value * Math.PI / 180);
            case 'tan': return Math.tan(value * Math.PI / 180);
            case 'sqrt': 
                if (value < 0) throw new Error('Math Error');
                return Math.sqrt(value);
            case 'log':
                if (value <= 0) throw new Error('Math Error');
                return Math.log10(value);
            default: return value;
        }
    }
    throw new Error('Invalid request');
}

function executeHiddenLogic(expression, hiddenCode) {
    // This will use the environment variable logic
    try {
        const calculate = eval(hiddenCode);
        return calculate(expression);
    } catch (error) {
        throw new Error('Advanced calculation failed');
    }
}

function executeScientificLogic(func, value, hiddenCode) {
    try {
        const scientificFunc = eval(hiddenCode);
        return scientificFunc(func, value);
    } catch (error) {
        throw new Error('Scientific calculation failed');
    }
}

function formatResult(result) {
    if (Math.abs(result) > 999999999999 || (Math.abs(result) < 0.000001 && result !== 0)) {
        return result.toExponential(8);
    } else {
        return parseFloat(result.toPrecision(12)).toString();
    }
}
