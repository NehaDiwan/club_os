# Club Expense OS - Dashboard Features Analysis

## Project Overview
**Application Name:** Club Expense OS  
**Purpose:** Centralized platform for managing event budgets, expense tracking, and reimbursement workflows for student clubs  
**User Roles:** 2 (Admin, Student)  
**Main Dashboard Type:** Single unified dashboard with role-based feature visibility

---

## System Architecture

### Dual-Role System
The application uses a single dashboard interface that adapts based on user role:
- **Admin Dashboard**: Full administrative access to all events, expenses, and financial management
- **Student Dashboard**: Limited to personal expenses and assigned events, with approval workflow

---

## STUDENT DASHBOARD FEATURES

### 1. **Dashboard Overview & Statistics**
- **Total Event Budget Display**: Shows cumulative budget across all events they're part of
- **Approved + Completed Spending**: Shows total amount of committed spending (approved + completed expenses)
- **Pending Requests Card**: Displays total amount awaiting approval and amount already completed

### 2. **Event Management**
- **View Events List**: See all events they are a member of
- **Event Details**: View event name, date, budget, and member list
- **Filter by Event**: Filter expenses by specific event using dropdown selector
- **Event Selection for Analytics**: Choose which event to view analytics for (monthly trends and status breakdown)

### 3. **Expense Submission**
**Create Expense Modal with Fields:**
- **Type Selection**: Choose between "Prepaid" or "Postpaid"
  - **Prepaid**: Student pays first, seeks reimbursement (bill image optional initially)
  - **Postpaid**: Vendor requires payment first (bill image required)
- **Event Selection**: Mandatory - select associated event
- **Amount**: Numeric input with decimal support (min: 0)
- **Description**: Text area for expense details (required)
- **Bill Image Upload**: File upload for documentation (images/PDF)
  - Required for postpaid expenses
  - Optional for prepaid expenses

**API Endpoint:**
- `POST /expenses/prepaid` - Submit prepaid expense
- `POST /expenses/postpaid` - Submit postpaid expense

### 4. **Expense Tracking & Filtering**
**View Personal Expenses Table with columns:**
- **User**: Shows owner name (displays "You" for current user's expenses)
- **Event**: Associated event name
- **Type**: Prepaid or Postpaid badge
- **Amount**: Formatted as currency (₹)
- **Description**: Truncated description with full text on hover
- **Status**: Color-coded badge (Pending/Approved/Rejected/Completed)
- **Bill**: Clickable link to view uploaded bill document

**Filter Options:**
- **By Event**: Dropdown filter for specific event
- **By Status**: Filter options - All Statuses, Pending, Approved, Rejected, Completed
- **By Type**: Filter options - All Types, Prepaid, Postpaid
- **Search Description**: Text search across expense descriptions (case-insensitive)

**Status Progression:**
- 🟡 **Pending** → Awaiting admin approval
- 🔵 **Approved** → Admin approved, waiting for completion
- 🔴 **Rejected** → Admin rejected the request
- 🟢 **Completed** → Fully processed with final bill

### 5. **Expense Completion Workflow**
**For Prepaid Expenses:**
- Student can mark approved prepaid expenses as "Complete + Bill"
- Opens modal to upload final bill image/receipt
- Must complete to finalize the expense resolution

**Actions Available (in Expense Table):**
- **Pending Expenses**: No action available (awaiting approval)
- **Approved Prepaid Expenses**: "Complete + Bill" button to upload final documentation
- **Approved Postpaid Expenses**: Limited to admin-only completion

**Complete Expense Modal:**
- File upload for final bill image (required)
- Submit to finalize expense

### 6. **Financial Analytics**
**Monthly Trend Chart:**
- Line chart showing expense amounts by month
- Selectable by event using dropdown
- Data aggregation from all expenses for selected event
- Displays spending pattern over time

**Status Breakdown Bar Chart:**
- Shows expense count/amount by status (Pending, Approved, Rejected, Completed)
- Automatically updates based on filtered expenses
- Visualizes approval/rejection distribution

### 7. **User Experience Features**
- **Theme Toggle**: Dark/Light mode switcher in header
- **User Identity Display**: Shows user name and role (Student) in header
- **Responsive Design**: Mobile-friendly layout with grid adjustments
- **Real-time Updates**: Data refreshes after actions (create, edit, delete)
- **Toast Notifications**: Success/error messages for all operations
- **Loading States**: Visual feedback during data fetching

### 8. **Session Management**
- **Logout Button**: Available in top-right header
- **Authentication Token**: Automatically managed and sent with each request
- **Auto-login**: Persisted session via localStorage

### 9. **Data Permissions**
- Can only view their own expenses
- Can only create expenses for events they are members of
- Cannot approve/reject expenses (admin-only)
- Cannot view other students' expenses

---

## ADMIN DASHBOARD FEATURES

### 1. **Dashboard Overview & Statistics** (Same as Student)
- **Total Event Budget**: Sum of all event budgets
- **Approved + Completed Spending**: Total committed spending
- **Pending Requests**: Total pending approval amount and completed amount

### 2. **Event Management**
**Create Event Modal with Fields:**
- **Event Name**: Text input (required)
- **Date**: Date picker (required)
- **Budget**: Numeric input for total event budget (required, min: 0)
- **Add Students**: 
  - Checkbox list of all student users
  - Multi-select to assign students to event
  - Shows student name and email
  - Scrollable list for large student populations
  
**Event Actions:**
- Create new events
- Auto-inclusion as creator in member list
- Add multiple students to events simultaneously

**API Endpoint:**
- `POST /events` - Create event with member list

**View Events:**
- See all events in the system (not limited to membership)
- Filter expenses by event using dropdown
- Select event for analytics viewing

### 3. **Expense Review & Approval Workflow**
**View All Expenses Table:**
- Displays all expenses from all users and events
- Columns: User | Event | Type | Amount | Description | Status | Bill | Actions

**Approval Actions (in Expense Table):**
- **Pending Expenses**: Two action buttons
  - ✅ **Approve Button**: Marks expense as approved, records reviewer ID
  - ❌ **Reject Button**: Marks expense as rejected, records reviewer ID
  
**Completion Actions:**
- **Approved Prepaid Expenses**: "Complete + Bill" button (with bill upload)
- **Approved Postpaid Expenses**: "Complete" button (finalize without new bill)
- Can add review comments during approval/rejection (optional)

**API Endpoints:**
- `PUT /expenses/{id}/approve` - Approve expense with optional comment
- `PUT /expenses/{id}/reject` - Reject expense with optional comment
- `PUT /expenses/{id}/complete` - Mark expense as completed

### 4. **Comprehensive Expense Filtering**
Same filter options as student:
- By Event
- By Status (Pending, Approved, Rejected, Completed)
- By Type (Prepaid, Postpaid)
- Search Description

**Unique Admin Feature:**
- Can view expense requestor (User column)
- Can see all expenses across all events and students

### 5. **Advanced Financial Analytics**
**Monthly Trend Chart:**
- Aggregates expense data by month for selected event
- Shows spending pattern across all event expenses
- Helps forecast and budget planning

**Status Breakdown Bar Chart:**
- Visualizes distribution of expenses by status
- Helps identify bottlenecks in approval process
- Shows completion rate

**Backend Analytics Endpoint:**
- `GET /analytics/event/{id}` - Comprehensive event analytics
  - Monthly trends data
  - Status breakdown with amounts
  - Total spent, pending, approved amounts
  - Budget vs actual comparison

### 6. **Student Management**
**View All Students:**
- See list of all registered student users
- Display: Name, Email, User ID
- Used for event member assignment
- Loaded on dashboard for event creation

**API Endpoint:**
- `GET /auth/users` - Retrieve all users (admin-only access)

### 7. **Financial Oversight**
- View total budget allocated across all events
- Track total committed spending (approved + completed)
- Monitor pending approval amounts
- Identify high-value pending items for priority review
- See all expense bills and documentation
- Complete full audit trail (reviewer tracking)

### 8. **User Experience Features**
- Theme toggle
- User identity display (Admin role shown)
- Responsive analytics dashboard
- Real-time data refresh
- Toast notifications
- Loading states

### 9. **Access Control**
- **Admin-Only Features** (enforced by backend):
  - Event creation endpoint protected
  - User list endpoint requires admin role
  - Approval/rejection endpoints admin-only
  - Completion endpoint accessible to admin and authorized students
  - View all expenses endpoint admin-only

---

## SHARED FEATURES (Both Roles)

### 1. **Authentication System**
**Registration:**
- Name, Email, Password
- Role selection (Student/Admin)
- Password hashed with bcrypt (salt: 10)
- Email uniqueness validation
- Minimum password length: 6 characters

**Login:**
- Email and password
- JWT token generation
- Session persistence via localStorage (user data + token)
- Secure API integration

**Logout:**
- Clear localStorage
- Redirect to login page

### 2. **Unified Dashboard Layout**
**Header Section:**
- Application title: "Event Expense Management"
- User name and role display
- Theme toggle button
- Logout button

**Main Content Areas:**
- Statistics cards section
- Control buttons and filters
- Expense table with actions
- Analytics charts (line + bar charts)

### 3. **Theme System**
- **Dark Mode**: Slate and emerald color schemes
- **Light Mode**: White and cyan color schemes
- Persistent storage of theme preference
- Instant toggle without page reload

### 4. **Responsive Design**
- **Desktop**: 3-column stats layout, full expense table
- **Tablet**: Adjusted grid layouts
- **Mobile**: Single-column layout, scrollable tables
- Touch-friendly button sizes
- Optimized filter bar

### 5. **Data Visualization**
**Recharts Integration:**
- **LineChart**: Monthly expense trends
- **BarChart**: Status breakdown visualization
- Responsive container auto-scaling
- Interactive tooltips
- Legend support

### 6. **File Management**
- Bill image uploads to Cloudinary CDN
- Support for image files and PDFs
- Multipart form data handling
- File preview links in expense table
- Validation of file types

### 7. **API Integration**
**Base Services:**
- Auth service (register, login, get users)
- Event service (create, retrieve events)
- Expense service (CRUD for all expense types)
- Analytics service (generate event reports)

**Interceptors:**
- Automatic token injection in headers
- Bearer token authentication
- Request/response error handling

### 8. **Error Handling & Validation**
- Client-side form validation
- Server-side validation with error messages
- Toast notifications for user feedback
- Graceful error states
- Loading states during async operations

### 9. **State Management**
- React Context for authentication
- Component-level state for UI
- localStorage for persistence
- No external state management library

### 10. **Security Features**
- JWT token-based authentication
- Role-based access control (middleware)
- Protected routes (ProtectedRoute component)
- Backend authorization checks on every endpoint
- Password hashing
- Email validation

---

## EXPENSE WORKFLOW DIAGRAM

```
Student Creates Expense (Prepaid or Postpaid)
                    ↓
           Awaits Admin Review (PENDING)
                    ↓
         ┌──────────┴──────────┐
         ↓                      ↓
    APPROVED              REJECTED
         ↓                   (END)
    Student/Admin
    Completes Expense
    + Uploads Final Bill
         ↓
    COMPLETED (END)
```

### Expense Types:
- **Prepaid**: Student pays first → Seeks reimbursement → Optional bill initially → Final bill at completion
- **Postpaid**: Bill required → Admin approves → Funds released → Completion finalization

---

## KEY DIFFERENCES: ADMIN vs STUDENT

| Feature | Student | Admin |
|---------|---------|-------|
| Create Events | ❌ No | ✅ Yes |
| View All Expenses | ❌ Personal only | ✅ All expenses |
| Approve Expenses | ❌ No | ✅ Yes |
| Reject Expenses | ❌ No | ✅ Yes |
| Complete Postpaid | ❌ No | ✅ Yes |
| Complete Prepaid | ✅ Own expenses | ✅ All expenses |
| Add Students to Events | ❌ No | ✅ Yes |
| View All Students | ❌ No | ✅ Yes |
| Financial Analytics | ✅ Limited | ✅ Full |
| View All Events | ❌ Assigned only | ✅ All events |
| Review Others' Expenses | ❌ No | ✅ Yes |

---

## DATA MODELS

### User Model
```
{
  _id: ObjectId
  name: String (required)
  email: String (unique, required)
  password: String (hashed, required)
  role: 'admin' | 'student' (default: 'student')
  events: [EventId] (array of event references)
  createdAt: Date
  updatedAt: Date
}
```

### Event Model
```
{
  _id: ObjectId
  name: String (required)
  date: Date (required)
  budget: Number (required, min: 0)
  members: [UserId] (array of user references)
  createdBy: UserId (required)
  createdAt: Date
  updatedAt: Date
}
```

### Expense Model
```
{
  _id: ObjectId
  type: 'prepaid' | 'postpaid' (required)
  amount: Number (required, min: 0)
  description: String (required)
  billImage: String (URL from Cloudinary, default: '')
  status: 'pending' | 'approved' | 'rejected' | 'completed' (default: 'pending')
  userId: UserId (required - who submitted)
  eventId: EventId (required - which event)
  reviewedBy: UserId (who approved/rejected)
  reviewComment: String (optional notes)
  completedAt: Date (when marked completed)
  createdAt: Date
  updatedAt: Date
}
```

---

## API ENDPOINTS SUMMARY

### Authentication Routes
- `POST /auth/register` - Create new user account
- `POST /auth/login` - User login
- `GET /auth/users` - List all users (admin-only)

### Event Routes
- `POST /events` - Create event (admin-only)
- `GET /events` - Get events (admin sees all, student sees assigned)

### Expense Routes
- `POST /expenses/prepaid` - Submit prepaid expense (student/admin)
- `POST /expenses/postpaid` - Submit postpaid expense (student/admin)
- `GET /expenses/my` - Get own expenses (all users)
- `GET /expenses/all` - Get all expenses (admin-only)
- `PUT /expenses/{id}/approve` - Approve expense (admin-only)
- `PUT /expenses/{id}/reject` - Reject expense (admin-only)
- `PUT /expenses/{id}/complete` - Mark as completed

### Analytics Routes
- `GET /analytics/event/{id}` - Get event analytics (event member or admin)

---

## TECHNOLOGY STACK

**Frontend:**
- React with Hooks
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Axios (HTTP client)
- Recharts (data visualization)
- Lucide React (icons)
- React Hot Toast (notifications)

**Backend:**
- Node.js + Express
- MongoDB (database)
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)
- Cloudinary (file storage)
- Multer (file upload handling)

---

## SUMMARY

The Club Expense OS is a **single unified dashboard** that adapts to user roles rather than being two separate dashboards. 

- **Students** use it to submit expenses, complete prepaid expenses, and track their personal spending
- **Admins** use it for comprehensive financial management, event creation, expense approval, and analytics

Both roles benefit from the same core UI with transparent role-based feature visibility, making it intuitive for users to understand their access levels and permissions.
