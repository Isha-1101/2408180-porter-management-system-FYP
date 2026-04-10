# 📚 API Documentation Index

Complete reference library for all frontend APIs and cleanup guides.

---

## 🎯 Start Here

**First time?** Read in this order:
1. [README.md](./README.md) - Overview of all APIs
2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - All endpoints at a glance
3. Find your feature in the domain folders (01-09)

**Need to clean up?** Read:
1. [UNUSED_APIS.md](./UNUSED_APIS.md) - What to delete
2. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - How to delete

**Making API changes?** Check:
1. [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) - Which components use what

---

## 📖 Documentation Files

### Main References

| File | Purpose | Time |
|------|---------|------|
| **[README.md](./README.md)** | API organization overview, folder structure, cleanup items | 5 min |
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | All endpoints in a quick lookup table | 2 min |
| **[API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md)** | Which components use which APIs (safe to modify) | 5 min |
| **[UNUSED_APIS.md](./UNUSED_APIS.md)** | Detailed cleanup guide with safe deletions | 10 min |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Quick cleanup checklist and next steps | 5 min |

### Domain-Specific Guides

| Domain | File | Endpoints | Components |
|--------|------|-----------|-----------|
| 🔐 Authentication | [01-authentication/README.md](./01-authentication/README.md) | 2 | 2 |
| 👤 Porter Management | [02-porter-management/README.md](./02-porter-management/README.md) | 10+ | 5 |
| 📅 Individual Bookings | [03-individual-bookings/README.md](./03-individual-bookings/README.md) | 12+ | 6 |
| 👥 Team Management | [04-team-management/README.md](./04-team-management/README.md) | 20+ | 5 |
| 📝 Registration | [05-porter-registration/README.md](./05-porter-registration/README.md) | 8 | 3 |
| 💰 Fare Calculation | [06-fare-calculation/README.md](./06-fare-calculation/README.md) | 1 | 2 |
| ⭐ Ratings | [07-ratings/README.md](./07-ratings/README.md) | 3 | 1 |
| 🛠️ Admin | [08-admin/README.md](./08-admin/README.md) | 27+ | 10 |
| 🔄 Utilities | [09-utilities/README.md](./09-utilities/README.md) | 1 | 1 |

---

## 🎓 Common Tasks

### "I need to understand API X"
→ Find domain (1-9) → Read that folder's README

**Examples:**
- Understanding booking flow → [03-individual-bookings/README.md](./03-individual-bookings/README.md)
- Team features → [04-team-management/README.md](./04-team-management/README.md)
- Admin dashboard → [08-admin/README.md](./08-admin/README.md)

---

### "I need to modify API X - is it safe?"
→ Check [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) → See which components use it

**Find:** Look for your API in the component section
**Check:** Count how many components depend on it
**Decide:** Modify carefully if heavily used, freely if rarely used

---

### "I need to find a specific endpoint"
→ Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) → Search by endpoint path

**Fastest way:** `Ctrl+F` and search endpoint name

---

### "I want to remove unused code"
→ Read [UNUSED_APIS.md](./UNUSED_APIS.md) → Follow [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

**Timeline:** ~30 minutes for complete cleanup

---

### "I'm adding a new API"
→ Follow pattern in relevant domain folder → Update documentation

**Steps:**
1. Create service file (copy pattern from existing)
2. Create hook file with React Query
3. Add to this documentation
4. Update dependency map

---

## 🗺️ Quick Navigation

### By Feature
- **User wants to book a porter:** [03-individual-bookings](./03-individual-bookings/README.md)
- **User wants to book a team:** [04-team-management](./04-team-management/README.md)
- **Porter registration process:** [05-porter-registration](./05-porter-registration/README.md)
- **Porter managing his profile:** [02-porter-management](./02-porter-management/README.md)
- **Admin managing system:** [08-admin](./08-admin/README.md)

### By User Role
- **End User:** Authentication (1), Individual Bookings (3), Ratings (7), Orders (3)
- **Porter:** Authentication (1), Registration (5), Management (2), Bookings (3)
- **Team Owner:** Team Management (4), Team Bookings (4)
- **Admin:** Admin Dashboard (8), all endpoints available

### By Data Flow
- **Login → Browse → Book → Complete → Rate**
  - [01-authentication](./01-authentication/README.md)
  - [03-individual-bookings](./03-individual-bookings/README.md) - search porters
  - [03-individual-bookings](./03-individual-bookings/README.md) - create booking
  - [03-individual-bookings](./03-individual-bookings/README.md) - complete
  - [07-ratings](./07-ratings/README.md) - rate

---

## 📊 Statistics

```
Total API Documentation      ~30 pages
Total Endpoints             ~100+
Active Services             9 files
Active Hooks               7 files
Components Documented      20+
Real-time Features         3 (polling)

Cleanup Items              2 files
Issues to Fix              3 (typos, patterns)
Estimated Cleanup Time     30 minutes
```

---

## 🔍 How to Find Things

### Find by Endpoint Name
1. Open [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Ctrl+F search endpoint
3. See hook name and component

### Find by Hook Name
1. Open [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. Ctrl+F search hook name
3. See endpoint and component

### Find by Component Name
1. Open [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md)
2. Search component name
3. See all APIs it uses

### Find by Service File
1. Open [README.md](./README.md)
2. Find service in section (1-9)
3. Click "View Details" for full documentation

---

## 📋 Cleanup Status

### ✅ Complete & Active
- All core APIs properly implemented
- React Query hooks for all services
- Axios instance for centralized auth
- Documentation complete

### ⚠️ Items to Fix
1. **Delete:** `src/apis/services/teamSearvice.js` (0 usage, duplicate)
2. **Delete/Refactor:** `src/apis/services/services.js` (17 unused endpoints)
3. **Fix Typo:** `porterRegistratioHooks.jsx` → `porterRegistrationHooks.jsx`
4. **Add Hooks:** Create rating hooks wrapper

**Details:** See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## 🚀 Getting Started

### For New Developers
1. Read [README.md](./README.md) (5 min overview)
2. Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (2 min all endpoints)
3. Find your feature domain (5 min deep dive)
4. Check [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) before changing

**Total: 15 minutes to understand the entire API structure**

### For Code Review
1. Check [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) for changed APIs
2. Verify no breaking changes to dependent components
3. Ensure new APIs follow documented patterns
4. Update documentation if adding new APIs

### For Maintenance
1. Keep [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) updated
2. Follow patterns from existing domain folders
3. Always create hooks wrapper for services
4. Use axiosInstance for all requests

---

## 📝 File Structure

```
docs/API_DOCUMENTATION/
│
├── INDEX.md                          ← You are here
├── README.md                         ← Start here (overview)
├── QUICK_REFERENCE.md               ← All endpoints table
├── API_DEPENDENCY_MAP.md            ← Component → API mapping
├── UNUSED_APIS.md                   ← Cleanup guide
├── IMPLEMENTATION_SUMMARY.md        ← Cleanup checklist
│
├── 01-authentication/
│   └── README.md
├── 02-porter-management/
│   └── README.md
├── 03-individual-bookings/
│   └── README.md
├── 04-team-management/
│   └── README.md
├── 05-porter-registration/
│   └── README.md
├── 06-fare-calculation/
│   └── README.md
├── 07-ratings/
│   └── README.md
├── 08-admin/
│   └── README.md
└── 09-utilities/
    └── README.md
```

---

## ❓ FAQ

**Q: Which file should I read first?**
A: Start with [README.md](./README.md) for overview, then [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**Q: I'm making changes to an API, what do I check?**
A: [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md) - see which components will be affected

**Q: I want to delete an API file - is it safe?**
A: Check [UNUSED_APIS.md](./UNUSED_APIS.md) and [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md)

**Q: How long does it take to read all documentation?**
A: 30-60 minutes for complete understanding, 5 minutes for quick reference

**Q: How do I add a new API?**
A: Follow the pattern in a relevant domain folder, then update this documentation

**Q: Where are the actual API files?**
A: `src/apis/services/` and `src/apis/hooks/` (referenced throughout docs)

---

## 🔗 External References

- **Source Code:** `src/apis/`
- **Backend Docs:** See your backend API documentation
- **React Query:** https://tanstack.com/query/latest
- **Axios:** https://axios-http.com/

---

## 📞 Support

For questions about:
- **Specific endpoint:** See domain folder (01-09)
- **Component dependencies:** See [API_DEPENDENCY_MAP.md](./API_DEPENDENCY_MAP.md)
- **Safe deletions:** See [UNUSED_APIS.md](./UNUSED_APIS.md)
- **Cleanup process:** See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Quick lookup:** See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📈 Next Steps

1. **Understand:** Read [README.md](./README.md) (5 min)
2. **Reference:** Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for lookups
3. **Explore:** Dive into domain folders for details
4. **Cleanup:** Follow [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
5. **Maintain:** Keep docs updated as APIs change

---

**Documentation Version:** 1.0
**Last Updated:** 2026-04-10
**Status:** Complete and ready to use
**Cleanup Status:** Ready to execute
