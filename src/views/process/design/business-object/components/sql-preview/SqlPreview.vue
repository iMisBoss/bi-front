<template>
  <div class="sql-preview">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="sqlType" @change="handleSqlTypeChange">
          <el-radio-button label="create">建表脚本</el-radio-button>
          <el-radio-button label="alter">修改表脚本</el-radio-button>
          <el-radio-button label="drop">删除表脚本</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="sqlDialect" style="margin-left: 20px" @change="handleDialectChange">
          <el-radio-button label="mysql">MySQL</el-radio-button>
          <el-radio-button label="oracle">Oracle</el-radio-button>
          <el-radio-button label="postgresql">PostgreSQL</el-radio-button>
          <el-radio-button label="dameng">达梦数据库</el-radio-button>
          <el-radio-button label="kingbase">人大金仓</el-radio-button>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" size="default" icon="DocumentCopy" @click="handleCopySql">复制到剪贴板</el-button>
        <el-button size="default" icon="Download" @click="handleDownloadSql">下载 SQL 文件</el-button>
      </div>
    </div>

    <div class="sql-preview-box">
      <pre class="sql-code">{{ generatedSql }}</pre>
    </div>

    <div class="sql-footer">
      <el-alert
          :title="dialectInfo"
          type="info"
          :closable="false"
          show-icon
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const sqlType = ref('create')
const sqlDialect = ref('mysql')

// 模拟业务对象信息
const businessObjectInfo = {
  tableName: 'biz_leave_application',
  tableNameComment: '请假申请单',
  fields: [
    { name: 'id', type: 'bigint', comment: '主键 ID', primaryKey: true, autoIncrement: true },
    { name: 'bill_no', type: 'varchar(64)', comment: '单据编号', unique: true },
    { name: 'process_instance_id', type: 'varchar(64)', comment: '流程实例 ID', unique: true },
    { name: 'process_status', type: 'tinyint', comment: '流程状态', defaultValue: '0' },
    { name: 'start_user_id', type: 'bigint', comment: '发起人 ID' },
    { name: 'start_dept_id', type: 'bigint', comment: '发起部门 ID' },
    { name: 'leave_type', type: 'varchar(20)', comment: '请假类型' },
    { name: 'start_date', type: 'date', comment: '开始时间' },
    { name: 'end_date', type: 'date', comment: '结束时间' },
    { name: 'days', type: 'int', comment: '天数' },
    { name: 'reason', type: 'text', comment: '请假事由' },
    { name: 'create_time', type: 'datetime', comment: '创建时间', defaultValue: 'CURRENT_TIMESTAMP' },
    { name: 'create_by', type: 'bigint', comment: '创建人' },
    { name: 'update_time', type: 'datetime', comment: '修改时间' },
    { name: 'update_by', type: 'bigint', comment: '修改人' }
  ]
}

// 数据库方言信息
const dialectInfoMap = {
  mysql: 'MySQL 数据库：适用于 MySQL 5.7+ / 8.0+，支持自增主键、字符集设置',
  oracle: 'Oracle 数据库：适用于 Oracle 11g+，使用序列实现自增，注释语法不同',
  postgresql: 'PostgreSQL：支持 SERIAL 自增，COMMENT 语法独立，支持数组类型',
  dameng: '达梦数据库（信创）：国产数据库，兼容 Oracle 语法，支持国密算法',
  kingbase: '人大金仓（信创）：国产数据库，基于 PostgreSQL，兼容性好'
}

const dialectInfo = computed(() => {
  return `当前数据库：${dialectInfoMap[sqlDialect.value]}`
})

// 生成 SQL 脚本
const generatedSql = computed(() => {
  return generateSqlScript(sqlType.value, sqlDialect.value)
})

// 生成 SQL 脚本的核心函数
const generateSqlScript = (type, dialect) => {
  const now = new Date().toLocaleString('zh-CN')
  const tableName = businessObjectInfo.tableName
  const tableComment = businessObjectInfo.tableNameComment

  let sql = `-- ${businessObjectInfo.tableNameComment}业务对象 SQL 脚本\n`
  sql += `-- 生成时间：${now}\n`
  sql += `-- 数据库类型：${dialect.toUpperCase()}\n\n`

  if (type === 'create') {
    sql += generateCreateTable(tableName, tableComment, dialect)
  } else if (type === 'alter') {
    sql += generateAlterTable(tableName, dialect)
  } else if (type === 'drop') {
    sql += generateDropTable(tableName, dialect)
  }

  return sql
}

// 生成建表脚本
const generateCreateTable = (tableName, tableComment, dialect) => {
  let sql = ''

  if (dialect === 'mysql') {
    sql += `CREATE TABLE ${tableName} (\n`
    businessObjectInfo.fields.forEach((field, index) => {
      sql += `  ${field.name} ${field.type}`
      if (field.primaryKey) {
        sql += ' NOT NULL'
        if (field.autoIncrement) sql += ' AUTO_INCREMENT'
      } else {
        sql += ' DEFAULT NULL'
      }
      if (field.defaultValue && !field.primaryKey) {
        sql += ` DEFAULT ${field.defaultValue}`
      }
      sql += ` COMMENT '${field.comment}'`
      sql += index < businessObjectInfo.fields.length - 1 ? ',\n' : '\n'
    })
    sql += `  PRIMARY KEY (${businessObjectInfo.fields.find(f => f.primaryKey).name}),\n`
    businessObjectInfo.fields.filter(f => f.unique).forEach(f => {
      sql += `  UNIQUE KEY uk_${f.name} (${f.name}),\n`
    })
    businessObjectInfo.fields.filter(f => f.index && !f.unique && !f.primaryKey).forEach(f => {
      sql += `  KEY idx_${f.name} (${f.name}),\n`
    })
    sql = sql.trimEnd().replace(/,\s*$/, '') + '\n'
    sql += `) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='${tableComment}';`
  }
  else if (dialect === 'oracle') {
    sql += `CREATE TABLE ${tableName} (\n`
    businessObjectInfo.fields.forEach((field, index) => {
      let oracleType = field.type
      if (field.type === 'bigint') oracleType = 'NUMBER(19)'
      if (field.type === 'tinyint') oracleType = 'NUMBER(3)'
      if (field.type === 'int') oracleType = 'NUMBER(10)'
      if (field.type === 'datetime') oracleType = 'DATE'

      sql += `  ${field.name} ${oracleType}`
      if (field.primaryKey) {
        sql += ' NOT NULL'
      }
      if (field.defaultValue && !field.primaryKey) {
        sql += ` DEFAULT ${field.defaultValue === 'CURRENT_TIMESTAMP' ? 'SYSDATE' : field.defaultValue}`
      }
      sql += index < businessObjectInfo.fields.length - 1 ? ',\n' : '\n'
    })
    sql += `  CONSTRAINT pk_${tableName} PRIMARY KEY (${businessObjectInfo.fields.find(f => f.primaryKey).name})\n`
    sql += `);\n\n`
    sql += `COMMENT ON TABLE ${tableName} IS '${tableComment}';\n`
    businessObjectInfo.fields.forEach(field => {
      sql += `COMMENT ON COLUMN ${tableName}.${field.name} IS '${field.comment}';\n`
    })

    sql += `\n-- 创建序列（Oracle 自增实现）\n`
    const pkField = businessObjectInfo.fields.find(f => f.primaryKey)
    sql += `CREATE SEQUENCE seq_${tableName} START WITH 1 INCREMENT BY 1;\n`
  }
  else if (dialect === 'postgresql' || dialect === 'kingbase') {
    sql += `CREATE TABLE ${tableName} (\n`
    businessObjectInfo.fields.forEach((field, index) => {
      let pgType = field.type
      if (field.type === 'bigint' && field.autoIncrement) pgType = 'BIGSERIAL'
      if (field.type === 'int') pgType = 'INTEGER'
      if (field.type === 'tinyint') pgType = 'SMALLINT'
      if (field.type === 'varchar') pgType = 'VARCHAR'

      sql += `  ${field.name} ${pgType}`
      if (field.primaryKey && field.autoIncrement) {
        // BIGSERIAL 自动处理
      } else if (field.primaryKey) {
        sql += ' NOT NULL'
      }
      if (field.defaultValue && !field.primaryKey) {
        sql += ` DEFAULT ${field.defaultValue}`
      }
      sql += index < businessObjectInfo.fields.length - 1 ? ',\n' : '\n'
    })
    sql += `  CONSTRAINT pk_${tableName} PRIMARY KEY (${businessObjectInfo.fields.find(f => f.primaryKey).name})\n`
    sql += `);\n\n`
    sql += `COMMENT ON TABLE ${tableName} IS '${tableComment}';\n`
    businessObjectInfo.fields.forEach(field => {
      sql += `COMMENT ON COLUMN ${tableName}.${field.name} IS '${field.comment}';\n`
    })
  }
  else if (dialect === 'dameng') {
    // 达梦数据库（兼容 Oracle）
    sql += `CREATE TABLE ${tableName} (\n`
    businessObjectInfo.fields.forEach((field, index) => {
      let dmType = field.type
      if (field.type === 'bigint') dmType = 'BIGINT'
      if (field.type === 'tinyint') dmType = 'TINYINT'
      if (field.type === 'datetime') dmType = 'TIMESTAMP'

      sql += `  ${field.name} ${dmType}`
      if (field.primaryKey) {
        sql += ' NOT NULL'
        if (field.autoIncrement) sql += ' AUTO_INCREMENT'
      } else {
        sql += ' DEFAULT NULL'
      }
      if (field.defaultValue && !field.primaryKey) {
        sql += ` DEFAULT ${field.defaultValue}`
      }
      sql += index < businessObjectInfo.fields.length - 1 ? ',\n' : '\n'
    })
    sql += `  CONSTRAINT pk_${tableName} PRIMARY KEY (${businessObjectInfo.fields.find(f => f.primaryKey).name})\n`
    sql += `);\n\n`
    sql += `COMMENT ON TABLE ${tableName} IS '${tableComment}';\n`
    businessObjectInfo.fields.forEach(field => {
      sql += `COMMENT ON COLUMN ${tableName}.${field.name} IS '${field.comment}';\n`
    })
  }

  return sql
}

// 生成修改表脚本
const generateAlterTable = (tableName, dialect) => {
  let sql = `-- 修改表 ${tableName} 的示例脚本\n\n`

  if (dialect === 'mysql') {
    sql += `-- 添加字段\n`
    sql += `ALTER TABLE ${tableName} ADD COLUMN new_field VARCHAR(100) DEFAULT NULL COMMENT '新字段';\n\n`
    sql += `-- 修改字段\n`
    sql += `ALTER TABLE ${tableName} MODIFY COLUMN existing_field VARCHAR(200) DEFAULT NULL COMMENT '修改后的字段';\n\n`
    sql += `-- 删除字段\n`
    sql += `ALTER TABLE ${tableName} DROP COLUMN old_field;\n\n`
    sql += `-- 添加索引\n`
    sql += `ALTER TABLE ${tableName} ADD INDEX idx_new_field (new_field);`
  } else if (dialect === 'oracle') {
    sql += `-- 添加字段\n`
    sql += `ALTER TABLE ${tableName} ADD (new_field VARCHAR2(100) DEFAULT NULL);\n`
    sql += `COMMENT ON COLUMN ${tableName}.new_field IS '新字段';\n\n`
    sql += `-- 修改字段\n`
    sql += `ALTER TABLE ${tableName} MODIFY (existing_field VARCHAR2(200) DEFAULT NULL);\n\n`
    sql += `-- 删除字段\n`
    sql += `ALTER TABLE ${tableName} DROP COLUMN old_field;`
  } else {
    sql += `-- 添加字段\n`
    sql += `ALTER TABLE ${tableName} ADD COLUMN new_field VARCHAR(100) DEFAULT NULL;\n`
    sql += `COMMENT ON COLUMN ${tableName}.new_field IS '新字段';\n\n`
    sql += `-- 修改字段\n`
    sql += `ALTER TABLE ${tableName} ALTER COLUMN existing_field TYPE VARCHAR(200);\n\n`
    sql += `-- 删除字段\n`
    sql += `ALTER TABLE ${tableName} DROP COLUMN old_field;`
  }

  return sql
}

// 生成删除表脚本
const generateDropTable = (tableName, dialect) => {
  let sql = `-- 删除表 ${tableName}\n`
  sql += `-- 警告：此操作不可恢复，请谨慎执行！\n\n`

  if (dialect === 'oracle' || dialect === 'dameng') {
    sql += `DROP TABLE ${tableName} CASCADE CONSTRAINTS;\n\n`
    sql += `-- 删除序列（如果有）\n`
    sql += `DROP SEQUENCE seq_${tableName};`
  } else {
    sql += `DROP TABLE IF EXISTS ${tableName};`
  }

  return sql
}

// 切换 SQL 类型
const handleSqlTypeChange = () => {
  ElMessage.success(`已切换到${sqlType.value === 'create' ? '建表' : sqlType.value === 'alter' ? '修改表' : '删除表'}脚本`)
}

// 切换数据库方言
const handleDialectChange = () => {
  ElMessage.success(`已切换到${getDialectName(sqlDialect.value)}数据库脚本`)
}

// 获取数据库中文名
const getDialectName = (dialect) => {
  const names = {
    mysql: 'MySQL',
    oracle: 'Oracle',
    postgresql: 'PostgreSQL',
    dameng: '达梦',
    kingbase: '人大金仓'
  }
  return names[dialect] || dialect
}

// 复制到剪贴板
const handleCopySql = () => {
  navigator.clipboard.writeText(generatedSql.value).then(() => {
    ElMessage.success('SQL 脚本已复制到剪贴板')
  }).catch(() => {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = generatedSql.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('SQL 脚本已复制到剪贴板')
  })
}

// 下载 SQL 文件
const handleDownloadSql = () => {
  ElMessageBox.confirm('确定要下载 SQL 脚本文件吗？', '下载确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    const blob = new Blob([generatedSql.value], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    const dialect = getDialectName(sqlDialect.value)
    const type = sqlType.value === 'create' ? 'create' : sqlType.value === 'alter' ? 'alter' : 'drop'
    link.setAttribute('href', url)
    link.setAttribute('download', `${businessObjectInfo.tableName}_${type}_${dialect}.sql`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('SQL 文件下载成功')
  }).catch(() => {})
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
      align-items: center;
    }
  }

  .sql-preview-box {
    background-color: #1e1e1e;
    border-radius: 4px;
    padding: 16px;
    max-height: 500px;
    overflow: auto;
    border: 1px solid #333;

    .sql-code {
      margin: 0;
      color: #d4d4d4;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  .sql-footer {
    margin-top: 16px;
  }
}
</style>
