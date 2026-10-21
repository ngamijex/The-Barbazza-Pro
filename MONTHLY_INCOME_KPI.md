# 💰 MONTHLY INCOME KPI - BARBER PORTAL

## ✅ **New Feature Added!**

Barbers can now see their **Expected Monthly Income** - showing exactly what they'll take home at the end of the month!

---

## 📊 **What It Shows:**

### **Expected Monthly Income Card** (Highlighted with Gold Border)

```
┌─────────────────────────────────────────────────────┐
│  Expected Monthly Income                            │
│  Your estimated take-home salary at month end       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Monthly Commission (40%)     Recruitment Deduction │
│  ₣ 200,000                    - ₣ 10,000            │
│                                                      │
│  Credit Deductions            Expected Net Income   │
│  - ₣ 5,000                    ₣ 185,000 ← BOLD     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🧮 **Calculation Logic:**

### **Step 1: Monthly Commission (40%)**
```
Total services this month: 500,000 RWF
Barber's commission (40%): 200,000 RWF
```

### **Step 2: Recruitment Deduction**
```
Monthly deduction for recruitment advance: -10,000 RWF
```

### **Step 3: Credit Deductions**
```
Approved credit #1 monthly deduction: -3,000 RWF
Approved credit #2 monthly deduction: -2,000 RWF
Total credit deductions: -5,000 RWF
```

### **Step 4: Expected Net Income**
```
Monthly Commission:        200,000 RWF
- Recruitment Deduction:   -10,000 RWF
- Credit Deductions:        -5,000 RWF
─────────────────────────────────────
Expected Net Income:       185,000 RWF ✨
```

---

## 🎨 **Visual Design:**

### **Highlighted Card:**
- **Background**: Gradient (charcoal to slate)
- **Border**: 2px solid gold
- **Makes it stand out** as the most important KPI

### **Color Coding:**
- **Monthly Commission**: Default color (positive)
- **Deductions**: Red/Burgundy color (negative)
- **Expected Net Income**: **Large Bold Gold** (final result)

### **Typography:**
- Net Income: **1.8rem font size, bold**
- Most prominent number on the dashboard
- Easy to see at a glance

---

## 📅 **Time Period:**

**Current Month Only**
- Calculates from the 1st of the month
- Updates in real-time as services are added
- Resets at the start of each new month

**Example:**
- If today is December 15th
- Shows commission from Dec 1 - Dec 31
- Barber can see progress toward month-end salary

---

## 🔄 **Updates Automatically When:**

1. ✅ New service transaction added (commission increases)
2. ✅ Credit request approved (deduction added)
3. ✅ Credit paid off (deduction removed)
4. ✅ Recruitment advance updated by admin

---

## 💡 **Use Cases:**

### **For Barbers:**
```
"How much will I take home this month?"
"Can I afford to request more credit?"
"When will my recruitment advance be paid off?"
"Is it worth working extra days this month?"
```

### **Benefits:**
- **Transparency**: See exactly what you'll earn
- **Motivation**: Watch income grow throughout month
- **Planning**: Make informed financial decisions
- **Trust**: Clear breakdown of all deductions

---

## 📱 **Mobile-Optimized:**

The KPI card stacks properly on mobile:

```
Mobile View (Portrait):
┌─────────────────────┐
│ Monthly Commission  │
│ ₣ 200,000          │
└─────────────────────┘
┌─────────────────────┐
│ Recruitment Ded.    │
│ - ₣ 10,000         │
└─────────────────────┘
┌─────────────────────┐
│ Credit Deductions   │
│ - ₣ 5,000          │
└─────────────────────┘
┌─────────────────────┐
│ Expected Net Income │
│ ₣ 185,000          │
└─────────────────────┘
```

---

## 🔍 **Technical Details:**

### **Database Queries:**

1. **Monthly Gross Income:**
```sql
SELECT SUM(amount) FROM transactions
WHERE barber_id = ?
AND transaction_date >= [first_day_of_month]
AND transaction_date < [first_day_of_next_month]
```

2. **Recruitment Deduction:**
```sql
SELECT advance_monthly_deduction FROM barbers
WHERE barber_id = ?
```

3. **Credit Deductions:**
```sql
SELECT SUM(monthly_deduction) FROM barber_credits
WHERE barber_id = ?
AND status = 'approved'
AND remaining_balance > 0
```

### **Real-Time Updates:**
- Reactive to: `rv$refresh_credits`
- Updates when credits are approved/paid
- Recalculates on every dashboard view

---

## 📊 **Example Scenarios:**

### **Scenario 1: New Barber (First Month)**
```
Monthly Commission:        40,000 RWF (10 services)
Recruitment Deduction:    -10,000 RWF
Credit Deductions:             0 RWF
─────────────────────────────────────
Expected Net Income:       30,000 RWF
```

### **Scenario 2: Experienced Barber**
```
Monthly Commission:       300,000 RWF (busy month!)
Recruitment Deduction:    -10,000 RWF
Credit Deductions:         -8,000 RWF (2 credits)
─────────────────────────────────────
Expected Net Income:      282,000 RWF
```

### **Scenario 3: Almost Paid Off Recruitment**
```
Monthly Commission:       250,000 RWF
Recruitment Deduction:     -5,000 RWF (last payment!)
Credit Deductions:             0 RWF
─────────────────────────────────────
Expected Net Income:      245,000 RWF
```

---

## 🎯 **Dashboard Layout:**

**Order of Cards:**
1. **Today's Financial Summary** - Daily performance
2. **Expected Monthly Income** ← NEW! (Highlighted)
3. **Outstanding Balances** - Current debts
4. **Today's Services** - Service list

**Why This Order?**
- Most important info (monthly income) is near the top
- Barbers see their expected salary immediately
- Still shows today's performance for daily motivation

---

## ✨ **Result:**

Barbers now have **complete financial transparency**:

- ✅ See today's commission (40%)
- ✅ See monthly expected income
- ✅ Understand all deductions
- ✅ Plan their finances
- ✅ Stay motivated!

---

## 🚀 **Ready to Use!**

Restart the Shiny app and login as a barber to see the new **Expected Monthly Income** KPI!

**The most important number for barbers - front and center!** 💰✨


