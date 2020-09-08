// Budget Controller Module
// Wrapped in an IIFE for data encapsulation
var budgetController = (function () {

    // Expense function constructor
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Income function constructor
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // Store all items (income, expenses, totals, etc.) into 'data' object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {

        // Check if type is expense or income and create designated item Object
        addItem: function (type, des, val) {
            var newItem, id;

            // Create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Create new item based on type (income or expense)
            if (type === 'exp') {
                newItem = new Expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new Income(id, des, val);
            }

            // Push new item into designated data structure
            data.allItems[type].push(newItem);

            // Return new item
            return newItem;

        },

        // Calculate budget after newItem entry
        calculateBudget: function () {

            // Call functions that calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of spent income
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();

// UI Controller Module
// Wrapped in an IIFE for data encapsulation
var UIController = (function () {

    // Create object to allow easy UI customization in the future
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    }

    // Get input values - whether income/expense, description, and number
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        // Add list item to UI
        addListItem: function (obj, type) {
            var html, newHTML, element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace placeholder text with actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

        },

        // Clear the HTML fields
        clearFields: function () {
            var fields, fieldsArr;

            // Get description and value HTML fields
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            // Store fields in an array so they can be manipulated
            fieldsArr = Array.prototype.slice.call(fields);

            // Actually clear the fields
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            // Switch focus back to description for easy entry of items
            fieldsArr[0].focus();
        },

        // Display budget and update the UI
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        // Make DOMstrings object public
        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

// Global App Controller Module
// Wrapped in an IIFE for data encapsulation
var controller = (function (budgetCtrl, UICtrl) {

    // Setup the application's event listeners
    var setupEventListeners = function () {
        // Get DOMstrings object from UI Controller module
        var DOM = UICtrl.getDOMstrings();

        // Check button event listener
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // Event listener for 'Enter' keypress so it does the same thing as clicking check button
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display budget and update UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get field input data
        input = UICtrl.getInput();

        // Data validation for data entry
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add new item to user interface
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the HTML fields after entry
            UICtrl.clearFields();
            // 5. Calculate and update the budget
            updateBudget();
        }
    };

    return {
        init: function () {
            console.log('The application has started successfully.')
            // Clear out fields on application start
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

// Run the application
controller.init();