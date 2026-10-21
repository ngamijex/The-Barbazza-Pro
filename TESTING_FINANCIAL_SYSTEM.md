# 🧪 FINANCIAL SYSTEM TESTING GUIDE

## ✅ What Has Been Implemented

### **1. Database Structure** ✓
- **barbers table** enhanced with:
  - `recruitment_advance` - Initial advance amount
  - `advance_monthly_deduction` - Monthly payment
  - `advance_remaining` - Current balance
  
- **barber_credits table** created for emergency advances
- **monthly_salaries table** created for end-of-month calculations

### **2. Barber Portal** ✓
**Dashboard Tab:**
- Displays Gross Income (100% of services)
- Displays Your Commission (40% by default)
- Displays Shop Share (60%)
- Shows recruitment advance balance & monthly deduction
- Shows credit balance & total pending deductions

**Request Credit Tab:**
- Form to request emergency advances
- Reason field (required)
- View all credit requests (pending/approved/rejected)
- Status tracking

### **3. Manager Portal** ✓
**Credit Approvals Tab:**
- View all pending credit requests from barbers
- Approve requests with monthly deduction amount
- Reject requests with reason
- View all active credits (being deducted)
- View complete credit history

### **4. Admin Portal** ✓
**Barber Management:**
- Add recruitment advance when hiring barbers
- Set monthly deduction amount
- View all barber financial details in table
- Automatic username generation for new barbers
- Default password: `barber123`

## 🧪 Testing Workflow

### **TEST 1: Add Barber with Recruitment Advance**

**As Admin:**
1. Login as admin
2. Go to "Barber Management" tab
3. Click "Add New Barber"
4. Fill in:
   - Full Name: "Test Barber"
   - Phone: "0788123456"
   - Commission Rate: 40%
   - **Recruitment Advance Amount: 100,000 RWF**
   - **Monthly Deduction: 10,000 RWF**
5. Save
6. Verify barber appears in table with recruitment advance details
7. Note the username (e.g., `test_barber`) and password (`barber123`)

**Expected Result:**
- New barber created with user account
- Barber table shows: 100,000 recruitment advance, 10,000 monthly deduction, 100,000 balance

---

### **TEST 2: Barber Views Financial Dashboard**

**As Barber:**
1. Logout from admin
2. Login with barber credentials (username: `test_barber`, password: `barber123`)
3. View Dashboard tab

**Expected Result:**
- See financial summary with:
  - Gross Income: 0 (no services yet)
  - Your Commission (40%): 0
  - Shop Share (60%): 0
  - Recruitment Balance: 100,000 RWF
  - Monthly Deduction: 10,000 RWF / month
  - Credit Balance: 0
  - Total Pending: 100,000 RWF

---

### **TEST 3: Manager Adds Service for Barber**

**As Manager:**
1. Logout and login as manager
2. Go to "Daily Operations" tab
3. Add service:
   - Select Barber: Test Barber (B00X)
   - Select Service: Haircut
   - Amount: (auto-populated from service price)
   - Customer: "John Doe"
4. Click "Add Service"

**Expected Result:**
- Service recorded successfully
- Transaction appears in "Today's Transactions"

---

### **TEST 4: Barber Sees Commission**

**As Barber:**
1. Login as barber again
2. View Dashboard

**Expected Result:**
- Gross Income: Shows service amount (e.g., 5,000 RWF)
- Your Commission (40%): 2,000 RWF
- Shop Share (60%): 3,000 RWF
- Today's Services table shows the transaction

---

### **TEST 5: Barber Requests Credit**

**As Barber:**
1. Go to "Request Credit" tab
2. Fill form:
   - Amount Needed: 20,000 RWF
   - Reason: "Emergency medical expense"
3. Click "Submit Request"

**Expected Result:**
- Success notification
- Request appears in "My Credit Requests" table with status "Pending"

---

### **TEST 6: Manager Approves Credit**

**As Manager:**
1. Login as manager
2. Go to "Credit Approvals" tab
3. See pending request from Test Barber
4. Click "Approve"
5. Set monthly deduction: 5,000 RWF
6. Add notes (optional)
7. Click "Approve Credit"

**Expected Result:**
- Request disappears from "Pending" table
- Appears in "Active Credits" table
- Shows 20,000 remaining balance

---

### **TEST 7: Barber Sees Updated Deductions**

**As Barber:**
1. Refresh or go back to Dashboard
2. View "Monthly Deductions" section

**Expected Result:**
- Recruitment Balance: 100,000 RWF
- Monthly Deduction: 10,000 RWF / month
- Credit Balance: 20,000 RWF
- Total Pending: 120,000 RWF

---

### **TEST 8: Manager Rejects Credit**

**As Manager:**
1. Have another barber request credit
2. Go to "Credit Approvals" tab
3. Click "Reject" on the pending request
4. Enter rejection reason
5. Confirm

**Expected Result:**
- Request moved to "Credit History" with status "Rejected"
- Not shown in "Active Credits"

---

## 📊 Data Verification Queries

If you want to verify data directly in the database:

```sql
-- Check barber financial details
SELECT 
  b.barber_code,
  u.full_name,
  b.recruitment_advance,
  b.advance_monthly_deduction,
  b.advance_remaining,
  b.commission_rate
FROM barbers b
JOIN users u ON b.user_id = u.user_id;

-- Check credit requests
SELECT 
  c.credit_id,
  b.barber_code,
  c.amount,
  c.status,
  c.remaining_balance,
  c.monthly_deduction
FROM barber_credits c
JOIN barbers b ON c.barber_id = b.barber_id;

-- Calculate daily commission for a barber
SELECT 
  b.barber_code,
  SUM(t.amount) as gross_income,
  SUM(t.amount) * (b.commission_rate / 100) as commission,
  COUNT(*) as services_count
FROM transactions t
JOIN barbers b ON t.barber_id = b.barber_id
WHERE t.transaction_date = CURRENT_DATE
GROUP BY b.barber_id, b.barber_code, b.commission_rate;
```

## 🎯 Business Logic Summary

### **Commission Calculation**
```
For each service:
- Barber performs service worth: 10,000 RWF (100%)
- Barber gets: 4,000 RWF (40% commission)
- Shop keeps: 6,000 RWF (60% shop share)
```

### **Monthly Deductions (End of Month)**
```
Gross Earnings for month: 500,000 RWF
Commission (40%): 200,000 RWF
Deductions:
  - Recruitment: -10,000 RWF
  - Credits: -5,000 RWF
  - Total Deductions: -15,000 RWF
Final Salary: 185,000 RWF
```

### **Credit System**
1. Barber requests emergency advance
2. Manager reviews and approves/rejects
3. If approved, manager sets monthly deduction
4. Balance tracked in `barber_credits` table
5. Deducted at month end (future feature)

## ⚠️ Known Limitations

1. **Monthly Salary Processing**: Not yet automated - admin needs to manually process at month end
2. **Automatic Deductions**: Credits and recruitment advances are tracked but not automatically deducted yet
3. **Payment History**: Monthly payment tracking is in database but UI not yet built
4. **Commission Rate**: Default is 40%, but can be customized per barber

## 🔄 Future Enhancements

- [ ] Automated monthly salary calculation
- [ ] Automatic deduction processing at month end
- [ ] Payment history view for barbers
- [ ] SMS/Email notifications for credit approvals
- [ ] Barber performance bonuses
- [ ] Variable commission rates based on performance


