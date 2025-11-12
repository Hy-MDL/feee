# NEXUS-ALPHA IMPLEMENTATION CHECKLIST
## Left Sidebar Integration & Full Platform Redesign

**Date**: 2025-11-12
**Goal**: Implement left sidebar navigation + standardize all pages to Learn/Arena quality
**Timeline**: 6 weeks (42 days)

---

## 📋 PHASE 0: PREPARATION (Week 1) - Days 1-5

### ✅ Day 1: Component Cleanup
**Goal**: Remove all duplicate components

#### Tasks
- [ ] **Backup current state**
  ```bash
  git checkout -b backup/before-unified-nav
  git push origin backup/before-unified-nav
  ```

- [ ] **Delete duplicate components**
  ```bash
  # Delete core folder duplicates
  rm -rf apps/web/src/components/core/

  # Verify only layout folder remains
  ls apps/web/src/components/layout/
  # Should see: GlobalTopNav.tsx, Header.tsx, MobileNavbar.tsx, Sidebar.tsx
  ```

- [ ] **Update imports** (search & replace across codebase)
  ```bash
  # Find all imports from core
  grep -r "from '@/components/core" apps/web/src/

  # Replace with layout imports (manual or script)
  ```

- [ ] **Test build**
  ```bash
  cd apps/web
  npm run build
  # Should succeed with no errors
  ```

**Estimated Time**: 3-4 hours

---

### ✅ Day 2: Create Base Layout Components

#### Task 1: Create UnifiedLayout
**File**: `apps/web/src/components/layout/UnifiedLayout.tsx`

```typescript
'use client';

import { useState } from 'react';
import { TopBar } from './TopBar';
import { LeftSidebar } from './LeftSidebar';

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

export function UnifiedLayout({ children }: UnifiedLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Top bar */}
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-14"> {/* pt-14 for top bar height */}
        {/* Left sidebar */}
        <LeftSidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main content */}
        <main
          className={cn(
            "flex-1 overflow-auto transition-all",
            "lg:ml-60", // Desktop: sidebar width
            sidebarCollapsed && "lg:ml-16" // Desktop collapsed
          )}
        >
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
```

**Checklist**:
- [ ] Create file
- [ ] Import dependencies
- [ ] Test renders without errors
- [ ] Mobile overlay works

**Estimated Time**: 2 hours

---

#### Task 2: Create TopBar
**File**: `apps/web/src/components/layout/TopBar.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Menu, Bell, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-black/95 backdrop-blur border-b border-border-primary">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-magenta flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <h1 className="text-lg font-bold text-accent-cyan hidden sm:inline">
              Nexus-Alpha
            </h1>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search (optional - can add later) */}
          <button className="p-2 text-text-secondary hover:text-text-primary transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-magenta rounded-full"></span>
          </button>

          {/* User menu */}
          <Link
            href="/mypage"
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all',
              pathname === '/mypage'
                ? 'bg-gradient-to-br from-accent-cyan to-accent-magenta ring-2 ring-accent-cyan/50'
                : 'bg-gradient-to-br from-accent-cyan/80 to-accent-magenta/80 hover:opacity-80'
            )}
            title="My Page"
          >
            <User className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] Create file
- [ ] Mobile menu button calls onMenuClick
- [ ] Logo links to home
- [ ] Notifications show badge
- [ ] User avatar links to MyPage
- [ ] Test on mobile and desktop

**Estimated Time**: 1.5 hours

---

### ✅ Day 3: Create LeftSidebar

#### Task 1: Create LeftSidebar Component
**File**: `apps/web/src/components/layout/LeftSidebar.tsx`

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home, Sparkles, Landmark, FileText, Trophy, BookOpen,
  Users, Settings, ChevronLeft, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavSection } from './NavSection';

interface LeftSidebarProps {
  open: boolean; // Mobile
  collapsed: boolean; // Desktop
  onClose: () => void; // Mobile close
  onToggleCollapse: () => void; // Desktop toggle
}

const mainNavigation = {
  core: [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Sparkles, label: 'Sim Lab', href: '/simulation', badge: 'new' },
  ],
  platform: [
    { icon: Landmark, label: 'Ontology', href: '/ontology' },
    { icon: FileText, label: 'Reports', href: '/reports' },
    { icon: Trophy, label: 'Arena', href: '/arena' },
    { icon: BookOpen, label: 'Learn', href: '/learn' },
  ],
  social: [
    { icon: Users, label: 'Community', href: '/community' },
  ],
  system: [
    { icon: Settings, label: 'Admin', href: '/ceo-dashboard' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
  ],
};

export function LeftSidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
}: LeftSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-14 bottom-0 bg-background-secondary border-r border-border-primary transition-all z-40",
          // Mobile
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop width
          collapsed ? "lg:w-16" : "lg:w-60"
        )}
      >
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-6 w-6 h-6 bg-background-tertiary border border-border-primary rounded-full items-center justify-center hover:bg-background-secondary transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>

        {/* Navigation */}
        <nav className="flex flex-col h-full p-3 overflow-y-auto">
          <NavSection
            title="Core"
            items={mainNavigation.core}
            collapsed={collapsed}
          />

          <NavSection
            title="Platform"
            items={mainNavigation.platform}
            collapsed={collapsed}
          />

          <NavSection
            title="Social"
            items={mainNavigation.social}
            collapsed={collapsed}
          />

          {/* Spacer */}
          <div className="flex-1" />

          <NavSection
            title="System"
            items={mainNavigation.system}
            collapsed={collapsed}
          />

          {/* Stats widget (only when expanded) */}
          {!collapsed && (
            <div className="mt-4 p-3 bg-background-tertiary rounded-lg border border-border-primary">
              <div className="text-xs text-text-tertiary mb-2">Quick Stats</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Simulations</span>
                  <span className="text-text-primary font-semibold">127</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">XP</span>
                  <span className="text-accent-cyan font-semibold">2,450</span>
                </div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
```

**Checklist**:
- [ ] Create file
- [ ] Desktop collapse button works
- [ ] Mobile slide-in animation works
- [ ] All navigation items render
- [ ] Stats widget shows when expanded
- [ ] Test responsive behavior

**Estimated Time**: 3 hours

---

#### Task 2: Create NavSection Component
**File**: `apps/web/src/components/layout/NavSection.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
}

interface NavSectionProps {
  title: string;
  items: NavItem[];
  collapsed: boolean;
}

export function NavSection({ title, items, collapsed }: NavSectionProps) {
  const pathname = usePathname();

  return (
    <div className="mb-6">
      {/* Section title */}
      {!collapsed && (
        <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">
          {title}
        </div>
      )}

      {/* Nav items */}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                isActive
                  ? "bg-accent-cyan/10 text-accent-cyan"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-accent-cyan"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-xs px-1.5 py-0.5 bg-accent-magenta/20 text-accent-magenta rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent-cyan rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**Checklist**:
- [ ] Create file
- [ ] Active state highlights correctly
- [ ] Hover effects work
- [ ] Badges display
- [ ] Tooltips show when collapsed
- [ ] Active indicator bar shows

**Estimated Time**: 1.5 hours

---

### ✅ Day 4: Apply UnifiedLayout

#### Task 1: Update Dashboard Layout
**File**: `apps/web/src/app/(dashboard)/layout.tsx`

```typescript
'use client';

import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UnifiedLayout>{children}</UnifiedLayout>;
}
```

**Checklist**:
- [ ] Update file
- [ ] Remove old GlobalTopNav import
- [ ] Test all dashboard pages

**Estimated Time**: 30 minutes

---

#### Task 2: Test All Pages
**Pages to Test**:
- [ ] /dashboard - Should render with sidebar
- [ ] /simulation - Should render with sidebar
- [ ] /learn - Should render with sidebar
- [ ] /arena - Should render with sidebar
- [ ] /ontology - Should render with sidebar
- [ ] /trading - Should render with sidebar
- [ ] /community - Should render with sidebar
- [ ] /reports - Should render with sidebar
- [ ] /ceo-dashboard - Should render with sidebar
- [ ] /filings - Should render with sidebar
- [ ] /mypage - Should render with sidebar

**Checklist per page**:
- [ ] Sidebar visible
- [ ] Current page highlighted
- [ ] Content not cut off
- [ ] Mobile responsive
- [ ] Collapse works

**Estimated Time**: 2 hours

---

### ✅ Day 5: Fix Inconsistent Pages

#### Task 1: Fix Reports Page Colors
**File**: `apps/web/src/app/(dashboard)/reports/page.tsx`

**Find & Replace**:
```typescript
// Find all instances of slate colors
slate-900 → background-secondary
slate-800 → background-tertiary
slate-700 → border-primary
slate-600 → border-secondary
slate-100 → text-primary
slate-200 → text-secondary
slate-300 → text-tertiary
```

**Checklist**:
- [ ] Search for "slate-" in file
- [ ] Replace all with platform colors
- [ ] Test page renders correctly
- [ ] Verify consistency with other pages

**Estimated Time**: 1 hour

---

#### Task 2: Add Navigation to MyPage
**File**: `apps/web/src/app/(dashboard)/mypage/page.tsx`

**Change**:
```typescript
// Current: No layout
export default function MyPage() {
  return (
    <div>
      {/* content */}
    </div>
  );
}

// Fixed: Ensure it's in (dashboard) route group
// If not, move file to: apps/web/src/app/(dashboard)/mypage/page.tsx
```

**Checklist**:
- [ ] Verify mypage is in (dashboard) folder
- [ ] If not, move it
- [ ] Test navigation works
- [ ] Sidebar highlights MyPage (need to add to nav if not there)

**Estimated Time**: 30 minutes

---

#### Task 3: Add Navigation to Company Pages
**Files**:
- `apps/web/src/app/company/[id]/circuit-diagram/page.tsx`
- `apps/web/src/app/company/[id]/analyst-report/page.tsx`

**Option 1**: Move to dashboard route group
```bash
mkdir -p apps/web/src/app/(dashboard)/company/[id]
mv apps/web/src/app/company/* apps/web/src/app/(dashboard)/company/
```

**Option 2**: Add UnifiedLayout manually
```typescript
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function CompanyPage() {
  return (
    <UnifiedLayout>
      {/* existing content */}
    </UnifiedLayout>
  );
}
```

**Checklist**:
- [ ] Choose approach (recommend Option 1)
- [ ] Apply to both pages
- [ ] Test navigation works
- [ ] Test company ID routing still works

**Estimated Time**: 1 hour

---

## ✅ PHASE 0 COMPLETION CHECKLIST

### Before Proceeding to Phase 1
- [ ] All duplicate components deleted
- [ ] UnifiedLayout created and working
- [ ] TopBar created and working
- [ ] LeftSidebar created and working
- [ ] NavSection created and working
- [ ] All 14 pages render with sidebar
- [ ] Mobile responsive (test on phone)
- [ ] Desktop collapse works
- [ ] Reports page uses correct colors
- [ ] MyPage has navigation
- [ ] Company pages have navigation
- [ ] Build succeeds with no errors
- [ ] No console errors

### Testing Checklist
```bash
# 1. Build test
cd apps/web
npm run build

# 2. Dev server test
npm run dev
# Visit each page and verify sidebar

# 3. Mobile test
# Chrome DevTools → Toggle Device Toolbar
# Test: iPhone SE, iPad, Desktop
```

### Screenshots to Take (for documentation)
- [ ] Desktop with sidebar expanded
- [ ] Desktop with sidebar collapsed
- [ ] Mobile with sidebar open
- [ ] Mobile with sidebar closed
- [ ] Each page with sidebar

---

## 📋 PHASE 1-5 CHECKLISTS (Coming Next)

### Phase 1: Design System Polish (Week 2)
_Detailed checklist in NEXUS_COMPLETE_INTEGRATION_REPORT.md_

- [ ] Standardize all pages to Learn/Arena style
- [ ] Create component library documentation
- [ ] Improve Dashboard page

### Phase 2: Feature Integration (Week 3-4)
- [ ] Obsidian-style knowledge graph
- [ ] Polymarket-style community features
- [ ] Left sidebar enhancements

### Phase 3: Full Integration (Week 5-6)
- [ ] Backend API integration
- [ ] Real-time WebSocket
- [ ] Testing and polish

---

## 🚀 GETTING STARTED

### Step 1: Create New Branch
```bash
git checkout -b feature/unified-left-sidebar-navigation
```

### Step 2: Start with Day 1
- Open this checklist
- Work through Day 1 tasks
- Check off each item as completed
- Commit frequently

### Step 3: Daily Commits
```bash
# End of each day
git add .
git commit -m "feat(layout): [Day X] - [what you completed]"
git push origin feature/unified-left-sidebar-navigation
```

### Step 4: End of Week Review
- Review all checkboxes
- Test all pages
- Take screenshots
- Create pull request for review

---

## 📊 PROGRESS TRACKING

| Day | Tasks | Status | Time Spent | Notes |
|-----|-------|--------|-----------|-------|
| Day 1 | Component Cleanup | ⏳ | 0/4h | |
| Day 2 | Base Layout | ⏳ | 0/3.5h | |
| Day 3 | LeftSidebar | ⏳ | 0/4.5h | |
| Day 4 | Apply Layout | ⏳ | 0/2.5h | |
| Day 5 | Fix Pages | ⏳ | 0/2.5h | |

**Total Estimated**: 17 hours (3.4 hours/day × 5 days)
**Actual**: _Track as you go_

---

## ❓ TROUBLESHOOTING

### Issue: Build fails after deleting core folder
**Solution**:
```bash
# Find remaining imports
grep -r "from '@/components/core" apps/web/src/

# Update each file manually or with sed
sed -i "s|@/components/core|@/components/layout|g" apps/web/src/**/*.tsx
```

### Issue: Sidebar not showing on some pages
**Check**:
1. Is page in `(dashboard)` route group?
2. If not, move it or add UnifiedLayout manually
3. Check browser console for errors

### Issue: Mobile sidebar doesn't close
**Check**:
1. Overlay click handler calls `onClose`
2. `open` prop is being updated
3. Test on actual mobile device (not just DevTools)

### Issue: Collapse button not visible
**Check**:
1. `hidden lg:flex` class on button
2. Z-index conflict
3. Button positioned with `absolute` correctly

---

## 🎉 SUCCESS CRITERIA

Phase 0 is complete when:
- ✅ All 14 pages have left sidebar
- ✅ Sidebar collapses on desktop
- ✅ Sidebar slides in on mobile
- ✅ All pages use consistent design system
- ✅ No duplicate components remain
- ✅ Build succeeds
- ✅ No console errors
- ✅ Responsive on mobile, tablet, desktop

**Ready to start? Begin with Day 1!** 🚀
