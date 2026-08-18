import type { ThemeConfig } from 'antd';

// ============================================================
// Ant Design Theme Configuration
// 4-Tier Theme Color Palette:
// 1st (Primary): Deep Green (#005a32, #238b45)
// 2nd (Secondary): Black (#141414)
// 3rd (Tertiary): White (#ffffff)
// 4th (Quaternary): Orange (#fa8c16)
// ============================================================

const themeConfig: ThemeConfig = {
  token: {
    // Brand Colors
    colorPrimary: '#005a32', // 1st: Primary Green
    colorSuccess: '#238b45',
    colorWarning: '#fa8c16', // 4th: Orange
    colorError: '#ff4d4f',
    colorInfo: '#238b45',

    // Typography
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // Border & Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    // Sizing
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,

    // Neutral Surfaces
    colorBgContainer: '#ffffff', // 3rd: White
    colorBgLayout: '#f5f5f5',
    colorBorderSecondary: '#f0f0f0',
    colorText: '#141414', // 2nd: Black

    // Links
    colorLink: '#005a32',
    colorLinkHover: '#238b45',
    colorLinkActive: '#003a20',
  },

  components: {
    Layout: {
      siderBg: '#141414', // 2nd: Black
      headerBg: '#ffffff', // 3rd: White
      bodyBg: '#f5f5f5',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: '#141414',
      darkItemSelectedBg: '#005a32', // 1st: Deep Green
      darkSubMenuItemBg: '#050505',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      iconSize: 16,
    },
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadowTertiary:
        '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Table: {
      borderRadius: 12,
      headerBg: '#fafafa',
      headerColor: '#141414',
      rowHoverBg: '#f2f9f5',
      headerBorderRadius: 12,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 36,
      paddingInline: 16,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 8,
      controlHeight: 36,
    },
    DatePicker: {
      borderRadius: 8,
      controlHeight: 36,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Notification: {
      borderRadiusLG: 12,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Statistic: {
      contentFontSize: 28,
    },
  },
};

export default themeConfig;
