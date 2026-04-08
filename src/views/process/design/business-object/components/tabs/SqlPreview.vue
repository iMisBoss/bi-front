<template>
  <div class="sql-preview">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="sqlType">
          <el-radio-button label="create">建表脚本</el-radio-button>
          <el-radio-button label="alter">修改表脚本</el-radio-button>
          <el-radio-button label="drop">删除表脚本</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="sqlDialect" style="margin-left: 20px">
          <el-radio-button label="mysql">MySQL</el-radio-button>
          <el-radio-button label="oracle">Oracle</el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" size="default" icon="DocumentCopy" @click="handleCopySql">复制到剪贴板</el-button>
        <el-button size="default" icon="Download" @click="handleDownloadSql">下载 SQL 文件</el-button>
      </div>
    </div>

    <div class="sql-preview-box">
      <pre class="sql-code">{{ sqlScript }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const sqlType = ref('create')
const sqlDialect = ref('mysql')
const sqlScript = ref(`-- 建信消金 OA - 业务对象 SQL 脚本
-- 生成时间：2024-01-15 10:30:00
-- 业务对象：请假申请单（biz_leave_application）

CREATE TABLE biz_leave_application (
  id bigint NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  bill_no varchar(64) NOT NULL COMMENT '单据编号',
  process_instance_id varchar(64) DEFAULT NULL COMMENT '流程实例 ID',
  process_status tinyint NOT NULL DEFAULT 0 COMMENT '流程状态',
  start_user_id bigint DEFAULT NULL COMMENT '发起人 ID',
  start_dept_id bigint DEFAULT NULL COMMENT '发起部门 ID',
  leave_type varchar(20) DEFAULT NULL COMMENT '请假类型',
  start_date date DEFAULT NULL COMMENT '开始时间',
  end_date date DEFAULT NULL COMMENT '结束时间',
  days int DEFAULT NULL COMMENT '天数',
  reason text DEFAULT NULL COMMENT '请假事由',
  create_time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  create_by bigint DEFAULT NULL COMMENT '创建人',
  update_time datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  update_by bigint DEFAULT NULL COMMENT '修改人',
  PRIMARY KEY (id),
  UNIQUE KEY uk_bill_no (bill_no),
  UNIQUE KEY uk_process_instance_id (process_instance_id),
  KEY idx_start_user_id (start_user_id),
  KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='请假申请单';`)

const handleCopySql = () => {
  navigator.clipboard.writeText(sqlScript.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const handleDownloadSql = () => {
  ElMessage.info('下载 SQL 文件功能开发中...')
}
</script>

<style scoped lang="scss">
.sql-preview {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .sql-preview-box {
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 16px;
    max-height: 500px;
    overflow: auto;

    .sql-code {
      margin: 0;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
