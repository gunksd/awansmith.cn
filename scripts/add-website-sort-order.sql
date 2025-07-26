-- 为网站表添加排序字段
ALTER TABLE websites ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 为现有网站设置默认排序值（按创建时间）
UPDATE websites 
SET sort_order = (
  SELECT ROW_NUMBER() OVER (PARTITION BY section ORDER BY created_at ASC)
  FROM websites w2 
  WHERE w2.id = websites.id
);

-- 创建索引以提高查询性能
CREATE INDEX idx_websites_section_sort ON websites(section, sort_order);
