// reportController.js

const Transaction       = require('../models/Transaction');
const TransactionLine   = require('../models/TransactionLine');
const MasterAccount     = require('../models/MasterAccount');
const { Op }            = require('sequelize');

exports.generateReport = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate, accountFilter, asOfDate } = req.body;

    // Validate inputs
    if (!reportType) {
      return res.status(400).json({ message: 'Report type is required' });
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // 1) Fetch only this user's master accounts
    const accounts = await MasterAccount.findAll({
      where: { NonAdminUserId: req.user.id }
    });

    // 2) Build transaction filter scoped to this user (plus date range)
    const txWhere = { NonAdminUserId: req.user.id };
    if (startDate && endDate) {
      txWhere.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // 3) Fetch this user's transactions + their lines (only on this user's accounts)
    const transactions = await Transaction.findAll({
      where: txWhere,
      include: [
        {
          model: TransactionLine,
          as: 'lines',
          include: [
            {
              model: MasterAccount,
              where: { NonAdminUserId: req.user.id }
            }
          ]
        }
      ]
    });

    let reportData;

    // Helper to categorize accounts
    const categorizeAccount = (accountName) => {
      const lower = accountName.toLowerCase();
      if (lower.includes('asset'))     return 'Assets';
      if (lower.includes('liability')) return 'Liabilities';
      if (lower.includes('equity'))    return 'Equity';
      if (lower.includes('revenue'))   return 'Revenue';
      if (lower.includes('expense'))   return 'Expenses';
      return 'Other';
    };

    switch (reportType) {
      case 'Trial Balance': {
        const trialBalance = accounts.reduce((acc, account) => {
          let debitTotal = 0, creditTotal = 0;

          transactions.forEach(tx =>
            tx.lines.forEach(line => {
              if (line.MasterAccountId === account.id) {
                debitTotal  += parseFloat(line.debitedAmount)  || 0;
                creditTotal += parseFloat(line.creditedAmount) || 0;
              }
            })
          );

          if (accountFilter &&
              !categorizeAccount(account.name)
                .toLowerCase()
                .includes(accountFilter.toLowerCase())
          ) {
            return acc;
          }

          if (debitTotal !== 0 || creditTotal !== 0) {
            acc.push({
              accountName: account.name,
              accountType: categorizeAccount(account.name),
              debit: debitTotal,
              credit: creditTotal,
            });
          }
          return acc;
        }, []);

        reportData = {
          reportType: 'Trial Balance',
          period: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time',
          data: trialBalance,
          totals: {
            debit:  trialBalance.reduce((sum, e) => sum + e.debit,  0),
            credit: trialBalance.reduce((sum, e) => sum + e.credit, 0),
          },
        };
        break;
      }

      case 'Balance Sheet': {
        const cutoffDate = asOfDate || endDate;
        if (!cutoffDate) {
          return res.status(400).json({ message: 'As-of date or end date is required for Balance Sheet' });
        }

        const balanceSheet = { Assets: [], Liabilities: [], Equity: [] };
        accounts.forEach(account => {
          let balance = 0;
          transactions.forEach(tx => {
            if (new Date(tx.date) <= new Date(cutoffDate)) {
              tx.lines.forEach(line => {
                if (line.MasterAccountId === account.id) {
                  balance += (parseFloat(line.debitedAmount)  || 0)
                           - (parseFloat(line.creditedAmount) || 0);
                }
              });
            }
          });
          const category = categorizeAccount(account.name);
          if (balance !== 0) {
            if (category === 'Assets')     balanceSheet.Assets.push({ accountName: account.name, balance });
            if (category === 'Liabilities')balanceSheet.Liabilities.push({ accountName: account.name, balance });
            if (category === 'Equity')     balanceSheet.Equity.push({ accountName: account.name, balance });
          }
        });

        reportData = {
          reportType: 'Balance Sheet',
          asOf: cutoffDate,
          data: balanceSheet,
          totals: {
            assets:     balanceSheet.Assets.reduce((sum, e) => sum + e.balance, 0),
            liabilities:balanceSheet.Liabilities.reduce((sum, e) => sum + e.balance, 0),
            equity:     balanceSheet.Equity.reduce((sum, e) => sum + e.balance, 0),
          },
        };
        break;
      }

      case 'Profit and Loss Statement': {
        const profitLoss = { Revenue: [], Expenses: [] };
        accounts.forEach(account => {
          let amount = 0;
          transactions.forEach(tx => {
            if (startDate && endDate &&
                new Date(tx.date) >= new Date(startDate) &&
                new Date(tx.date) <= new Date(endDate)
            ) {
              tx.lines.forEach(line => {
                if (line.MasterAccountId === account.id) {
                  amount += (parseFloat(line.creditedAmount) || 0)
                          - (parseFloat(line.debitedAmount)  || 0);
                }
              });
            }
          });
          const category = categorizeAccount(account.name);
          if (amount !== 0) {
            if (category === 'Revenue') profitLoss.Revenue.push({ accountName: account.name, amount });
            if (category === 'Expenses')profitLoss.Expenses.push({ accountName: account.name, amount });
          }
        });

        reportData = {
          reportType: 'Profit and Loss Statement',
          period: `${startDate} to ${endDate}`,
          data: profitLoss,
          totals: {
            revenue:  profitLoss.Revenue.reduce((sum, e) => sum + e.amount,  0),
            expenses: profitLoss.Expenses.reduce((sum, e) => sum + e.amount, 0),
            netIncome: profitLoss.Revenue.reduce((sum, e) => sum + e.amount, 0)
                     - profitLoss.Expenses.reduce((sum, e) => sum + e.amount, 0),
          },
        };
        break;
      }

      case 'Cash Flow Statement': {
        const cashFlow = { OperatingActivities: [] };
        accounts.forEach(account => {
          if (categorizeAccount(account.name) === 'Assets' &&
              account.name.toLowerCase().includes('cash')
          ) {
            let cashChange = 0;
            transactions.forEach(tx => {
              if (startDate && endDate &&
                  new Date(tx.date) >= new Date(startDate) &&
                  new Date(tx.date) <= new Date(endDate)
              ) {
                tx.lines.forEach(line => {
                  if (line.MasterAccountId === account.id) {
                    cashChange += (parseFloat(line.debitedAmount)  || 0)
                                - (parseFloat(line.creditedAmount) || 0);
                  }
                });
              }
            });
            if (cashChange !== 0) {
              cashFlow.OperatingActivities.push({ accountName: account.name, cashChange });
            }
          }
        });

        reportData = {
          reportType: 'Cash Flow Statement',
          period: `${startDate} to ${endDate}`,
          data: cashFlow,
          totals: {
            netCashFlow: cashFlow.OperatingActivities.reduce((sum, e) => sum + e.cashChange, 0),
          },
        };
        break;
      }

      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }

    res.json(reportData);
  } catch (err) {
    next(err);
  }
};
