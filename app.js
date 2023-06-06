const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
let expenses = [];
let dailySpendingLimit = 0;

app.post('/expense', (req, res) => {
    const { name, amount, date, category } = req.body;

    if (!name || !amount || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const dateString = new Date(date).toISOString();
    const expense = { name, amount, date: dateString, category };
    const totalSpentToday = expenses.reduce((total, expense) => {
        if (expense.date.startsWith(dateString.substring(0, 10))) {
            return total + expense.amount;
        }
        return total;
    }, 0);

    if (dailySpendingLimit > 0 && totalSpentToday + parseFloat(amount) > dailySpendingLimit) {
        return res.status(400).json({ error: 'Daily spending limit exceeded' });
    }

    expenses.push(expense);
    return res.status(201).json(expense);
});

app.get('/get_expenses', (req, res) => {
    return res.json(expenses);
});

app.post('/expenses/search', (req, res) => {
    const { date } = req.body;
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    const dateString = new Date(date).toISOString();
    const expensesForDay = expenses.filter(expense => expense.date.startsWith(dateString.substring(0, 10)));

    return res.json(expensesForDay);
});

app.post('/set_spending_limit', (req, res) => {
    const { limit } = req.body;

    if (!limit || isNaN(limit)) {
        return res.status(400).json({ error: 'Invalid limit value' });
    }

    dailySpendingLimit = parseFloat(limit);

    return res.json({ message: 'Daily spending limit set successfully' });
});

app.get('/get_spending_limit', (req, res) => {
    return res.json({ limit: dailySpendingLimit });
});



app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


