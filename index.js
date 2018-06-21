const methods = {
    min(value, length) {
        return value.length >= length;
    },
    max(value, length) {
        return value.length <= length;
    },
    between(value, min, max) {
        return value.length >= min && value.length <= max;
    }
};

const errors = {
    required: '# is required',
    min: 'The length of # must be more than $1',
    max: 'The length of # must be less than $1',
    between: 'The length of # must between $1 to $2',
};

class Validator {

    constructor() {
        this.methods = methods;
        this.errors = errors;
        this.valid = true;
        this.failed = [];
        this.msg = [];
    }

    check(rules, data, all) {
        for (let field in rules)
            if (rules.hasOwnProperty(field)) {
                const fieldRules = rules[field];
                if (data[field]) {
                    for (let rule in fieldRules)
                        if (fieldRules.hasOwnProperty(rule) && typeof this.methods[rule] === 'function') {
                            const args = fieldRules[rule];
                            let res;
                            if (Array.isArray(args))
                                res = this.methods[rule](data[field], ...args);
                            else
                                res = this.methods[rule](data[field], args);
                            if (!res) {
                                this.fail(field, rule, args);
                                if (all !== true)
                                    return;
                            }
                        }
                } else if (fieldRules['required'] === true) {
                    this.fail(field, 'required');
                    if (all !== true)
                        return;
                }
            }
    }

    checkAll(rules, data) {
        return this.check(rules, data, true);
    }

    fail(field, rule, args) {
        this.valid = false;
        this.msg.push(this.formatError(field, rule, args));
        this.failed.push(field);
    }

    formatError(field, rule, args) {
        let msg = this.errors[rule];
        if (!msg)
            return '';
        msg = msg.replace('#', field);
        if (args)
            if (Array.isArray(args))
                for (let i = 0; i < args.length; i++)
                    msg = msg.replace(`$${i + 1}`, args[i]);
            else
                msg = msg.replace('$1', args);
        return msg;
    }

    setMethod(name, method, msg) {
        this.methods[name] = method;
        this.errors[name] = msg;
    }

    setError(name, msg) {
        this.errors[name] = msg;
    }

}

exports = module.exports = Validator;