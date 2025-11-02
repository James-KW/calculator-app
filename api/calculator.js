// api/calculator.js - Temporary fix
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

            // Temporary: Use basic logic for all calculations
            if (expression) {
                result = evaluateBasic(expression);
            } else if (func && value !== undefined) {
                result = handleScientificBasic(func, value);
            } else {
                throw new Error('Invalid request');
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
function evaluateBasic(expression) {
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
}

function handleScientificBasic(func, value) {
    switch(func) {
        case 'sin': return Math.sin(value * Math.PI / 180);
        case 'cos': return Math.cos(value * Math.PI / 180);
        case 'tan': return Math.tan(value * Math.PI / 180);
        case 'asin': return Math.asin(value) * 180 / Math.PI;
        case 'sqrt': return Math.sqrt(value);
        case 'power': return Math.pow(value, 2);
        case 'log': return Math.log10(value);
        case 'ln': return Math.log(value);
        case 'factorial': 
            if (value < 0 || !Number.isInteger(value)) throw new Error('Math Error');
            let result = 1;
            for (let i = 2; i <= value; i++) result *= i;
            return result;
        case 'percent': return value / 100;
        case 'abs': return Math.abs(value);
        case 'exp': return Math.exp(value);
        case 'tenPower': return Math.pow(10, value);
        case 'random': return Math.random();
        default: return value;
    }
}

function formatResult(result) {
    if (Math.abs(result) > 999999999999 || (Math.abs(result) < 0.000001 && result !== 0)) {
        return result.toExponential(8);
    } else {
        return parseFloat(result.toPrecision(12)).toString();
    }
}
