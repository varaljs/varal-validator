const methods = {
    type(source, type) {
        return typeof source === type;
    },
    is(source, value) {
        return source === value;
    },
    in(source, ...values) {
        return values.indexOf(source) >= 0;
    },
    min(source, length) {
        return source.length >= length;
    },
    max(source, length) {
        return source.length <= length;
    },
    between(source, min, max) {
        return source.length >= min && source.length <= max;
    },
    regexp(source, regexp) {
        return regexp.test(source);
    }
};

const errors = {
    required: '# is required',
    type: '# must be type of $1',
    is: 'Incorrect value for #',
    in: 'Incorrect value for #',
    min: 'The length of # must be more than $1',
    max: 'The length of # must be less than $1',
    between: 'The length of # must between $1 to $2',
    regexp: '# not conform to the expected format'
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
                        if (fieldRules.hasOwnProperty(rule) && rule !== 'msg' && typeof this.methods[rule] === 'function') {
                            const args = fieldRules[rule];
                            let res;
                            if (Array.isArray(args))
                                res = this.methods[rule](data[field], ...args);
                            else
                                res = this.methods[rule](data[field], args);
                            if (!res) {
                                this.fail(field, rule, args, fieldRules['msg']);
                                if (all !== true)
                                    return;
                            }
                        }
                } else if (fieldRules['required'] === true) {
                    this.fail(field, 'required', null, fieldRules['msg']);
                    if (all !== true)
                        return;
                }
            }
    }

    checkAll(rules, data) {
        return this.check(rules, data, true);
    }

    fail(field, rule, args, msg) {
        this.valid = false;
        msg = msg || this.formatError(field, rule, args);
        if (this.msg.indexOf(msg) < 0)
            this.msg.push(msg);
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