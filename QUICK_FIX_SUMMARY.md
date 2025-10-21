# Quick Fix Summary - CSS Alignment Bugs

## 5 CRITICAL BUGS TO FIX IMMEDIATELY

### 1. Modal Footer Obscures Content (profile/profile.css, lines 1058-1072)
**Impact:** Content hidden on mobile, users can't scroll
```css
/* Change from position: fixed to position: sticky */
.modal-footer {
    position: sticky;  /* was: fixed */
    bottom: 0;
}

.modal-body {
    padding-bottom: 120px;  /* Add this */
}
```

### 2. Text Overflow on Mobile (profile/profile.css, around line 962-964)
**Impact:** 2.2rem stat values don't fit 320px screens
```css
@media (max-width: 480px) {
    .profile-stat-value {
        font-size: 1.8rem;  /* ADD THIS LINE */
    }
}
```

### 3. Z-Index Modal Conflicts (multiple files)
**Impact:** Modals layer incorrectly
```
Define stacking context:
- UI elements: 1-100
- Components: 1000-2000
- Modals: 10000-10100
```

### 4. Button Margin Override (profile/profile.css, lines 258, 262)
**Impact:** Buttons have unpredictable spacing
```css
/* REMOVE line 258: margin: 0; */
/* KEEP line 262: margin: 10px auto; */
```

### 5. Travel Card Padding Bug (profile/profile.css, lines 470, 472)
**Impact:** Inconsistent top/bottom padding
```css
/* Change from: */
.travel-content {
    padding: 20px;
    padding-top: 50px;
}

/* To: */
.travel-content {
    padding: 50px 20px 20px 20px;
}
```

---

## Files Affected (by severity)

### CRITICAL
- `profile/profile.css` - 5+ critical issues
- `maps/maps2gis_new.css` - Z-index conflicts
- `qr/qr.css` - Canvas sizing issues

### HIGH
- `maps/organization_card.css` - Button padding inconsistency
- `maps/maps2gis.css` - Duplicate media queries

### MEDIUM
- All files - No consistent spacing scale

---

## Testing Checklist

- [ ] Modal opens/closes properly on 320px screens
- [ ] Text doesn't overflow on small phones
- [ ] Modals appear above other content
- [ ] Buttons align consistently
- [ ] No duplicate style rules
- [ ] All mobile breakpoints (480px, 768px) work

---

## Full Report

See `CSS_ALIGNMENT_BUGS_REPORT.md` for complete analysis with 15+ detailed issues.
