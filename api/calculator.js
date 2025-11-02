// api/calculator.js - Fixed CORS version
module.exports = async (req, res) => {
    // CORS headers - খুব important!
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { expression, function: func, value } = req.body;
        
        console.log('API Received:', { expression, func, value });
        
        let result;

        if (expression) {
            // Handle basic expressions
            result = evaluateExpression(expression);
        } else if (func && value !== undefined) {
            // Handle scientific functions
            result = handleScientificFunction(func, parseFloat(value));
        } else {
            throw new Error('Invalid request - need expression or function');
        }

        res.status(200).json({
            success: true,
            result: result.toString()
        });
        
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(200).json({
            success: false,
            error: error.message
        });
    }
};

// Basic expression evaluation
function evaluateExpression(expr) {
    if (!expr || typeof expr !== 'string') {
        throw new Error('Invalid expression');
    }
    
    const sanitizedExpr = expr
        .replace(/×/g, '*')
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E)
        .replace(/%/g, '/100')
        .replace(/\^/g, '**')
        .replace(/Math\.PI/g, Math.PI)
        .replace(/Math\.E/g, Math.E);

    console.log('Evaluating expression:', sanitizedExpr);
    
    try {
        const result = eval(sanitizedExpr);
        
        if (typeof result !== 'number' || !isFinite(result)) {
            throw new Error('Math Error');
        }
        
        return formatResult(result);
    } catch (error) {
        throw new Error('Calculation Error: ' + error.message);
    }
}

// Scientific functions
function handleScientificFunction(func, value) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error('Invalid value');
    }
    
    console.log('Scientific function:', func, value);
    
    switch(func) {
        case 'sin':
            return formatResult(Math.sin(value * Math.PI / 180));
        case 'cos':
            return formatResult(Math.cos(value * Math.PI / 180));
        case 'tan':
            if (Math.abs(value % 180) === 90) throw new Error('Math Error');
            return formatResult(Math.tan(value * Math.PI / 180));
        case 'asin':
            if (value < -1 || value > 1) throw new Error('Math Error');
            return formatResult(Math.asin(value) * 180 / Math.PI);
        case 'sqrt':
            if (value < 0) throw new Error('Math Error');
            return formatResult(Math.sqrt(value));
        case 'power':
            return formatResult(Math.pow(value, 2));
        case 'powerY':
            return formatResult(Math.pow(value, value));
        case 'log':
            if (value <= 0) throw new Error('Math Error');
            return formatResult(Math.log10(value));
        case 'ln':
            if (value <= 0) throw new Error('Math Error');
            return formatResult(Math.log(value));
        case 'factorial':
            if (value < 0 || !Number.isInteger(value)) throw new Error('Math Error');
            let result = 1;
            for (let i = 2; i <= value; i++) result *= i;
            return formatResult(result);
        case 'percent':
            return formatResult(value / 100);
        case 'abs':
            return formatResult(Math.abs(value));
        case 'exp':
            return formatResult(Math.exp(value));
        case 'tenPower':
            return formatResult(Math.pow(10, value));
        case 'random':
            return formatResult(Math.random());
        case 'mod':
            return formatResult(value % 1);
        default:
            throw new Error('Unknown function: ' + func);
    }
}

// Format the result properly
function formatResult(result) {
    if (result === 0) return '0';
    
    if (Math.abs(result) > 999999999999 || (Math.abs(result) < 0.000001 && result !== 0)) {
        return result.toExponential(8);
    } else {
        // Remove trailing .0 and unnecessary decimals
        const formatted = parseFloat(result.toPrecision(12));
        return formatted.toString();
    }
}
