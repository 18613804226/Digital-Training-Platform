export interface PageProps {
  title?: string;
  description?: string;
  contentClass?: string;
  /**
   * 根据content可见高度自适应
   */
  autoContentHeight?: boolean;
  headerClass?: string;
  footerClass?: string;
  /**
   * Custom height offset value (in pixels) to adjust content area sizing
   * when used with autoContentHeight
   * @default 0
   */
  heightOffset?: number;
  loading?: boolean; // 👈 新增
  loadingText?: string;
}
