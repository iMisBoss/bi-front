<template>
  <el-dialog
      v-model="dialogVisible"
      :width="isVersionEdit ? '1400px' : '1200px'"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleDialogClose"
      :class="['edit-dialog', { 'version-edit': isVersionEdit }]"
  >
    <!-- 版本编辑模式的顶部版本信息栏 -->
    <div v-if="isVersionEdit" class="version-header">
      <div class="version-header-left">
        <el-icon class="header-icon"><Document /></el-icon>
        <div class="header-text">
          <div class="header-title">编辑业务对象 - {{ formData.name }}（V{{ newVersion }} 新版本编辑）</div>
          <div class="version-info-bar">
            <span>基于正式版本 V{{ originalVersion }} 创建</span>
            <span class="divider">|</span>
            <span>原版本生效时间：{{ data?.createTime || '2024-01-01' }}</span>
            <span class="divider">|</span>
            <span>新版本创建人：当前用户</span>
            <span class="divider">|</span>
            <span>创建时间：{{ currentTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 普通编辑模式的顶部 -->
    <div v-else class="dialog-header">
      <el-icon class="header-icon"><Document /></el-icon>
      <div class="header-text">
        <div class="header-title">编辑业务对象</div>
        <div class="header-subtitle">配置业务对象的字段、关联、索引等</div>
      </div>
    </div>

    <div class="dialog-content">
      <!-- 顶部基本信息 -->
      <div class="basic-info">
        <el-form :model="formData" :rules="formRules" ref="formRef" :label-width="isVersionEdit ? '110px' : '100px'" class="basic-form">
          <!-- 版本说明（仅版本编辑模式显示） -->
          <el-form-item v-if="isVersionEdit" label="版本说明" prop="versionDescription" class="version-description-item">
            <el-input
                v-model="versionDescription"
                type="textarea"
                :rows="2"
                placeholder="请详细描述本次版本修改内容"
                maxlength="500"
                show-word-limit
                class="version-textarea"
            />
            <span class="version-tip">必填项，发布前必须填写</span>
          </el-form-item>

          <div class="form-row">
            <el-form-item label="业务对象名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入业务对象名称" style="width: 280px" />
            </el-form-item>

            <el-form-item label="数据库表名" prop="tableName" class="table-name-item">
              <el-input
                  v-model="formData.tableName"
                  :disabled="isVersionEdit"
                  :class="{ 'locked-input': isVersionEdit }"                  style="width: 280px"
              >
              </el-input>
              <el-tooltip v-if="isVersionEdit" content="表名锁定，版本发布后不可修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>

            <el-form-item label="所属业务域" prop="domain" class="domain-item">
              <el-select
                  v-model="formData.domain"
                  placeholder="请选择业务域"
                  style="width: 200px"
                  @change="handleDomainChange"
              >
                <el-option label="人事类" value="hr" />
                <el-option label="财务类" value="finance" />
                <el-option label="行政类" value="admin" />
                <el-option label="风控类" value="risk" />
                <el-option label="信贷类" value="loan" />
              </el-select>
              <el-tooltip v-if="isVersionEdit" content="仅支持同域调整，不支持跨域修改" placement="top">
                <el-icon class="tip-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-form-item>
          </div>

          <el-form-item label="备注" prop="remark" class="remark-item">
            <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="2"
                placeholder="请输入备注信息"
                class="remark-textarea"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- Tab 标签栏 -->
      <el-tabs v-model="activeTab" class="edit-tabs">
        <!-- 字段定义 -->
        <el-tab-pane name="fields">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Document /></el-icon>
              <span>字段定义</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="Plus" @click="handleAddField">新增字段</el-button>
              <el-button size="default" icon="Setting">批量设置</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Upload">导入字段</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Download">导出字段</el-button>
            </div>
            <div v-if="isVersionEdit" class="toolbar-right">
              <el-alert type="info" :closable="false" show-icon class="version-tip">
                <template #title>
                  <span>新版本编辑模式：原字段禁止删除和修改核心属性，仅可调整列表显示、敏感等级等非核心配置</span>
                </template>
              </el-alert>
            </div>
          </div>

          <el-table :data="fieldList" border style="width: 100%" max-height="400">
            <el-table-column prop="fieldName" label="字段名称" min-width="120" />
            <el-table-column prop="fieldCode" label="数据库列名" min-width="150" />
            <el-table-column prop="dataType" label="字段类型" min-width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="row.isNewField ? 'success' : 'info'">
                  {{ row.dataType }}
                  <el-icon v-if="row.isNewField" class="new-icon"><Top /></el-icon>
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="长度" min-width="70" align="center" />
            <el-table-column prop="required" label="必填" min-width="60" align="center">
              <template #default="{ row }">
                <el-switch
                    v-if="!row.system && (!isVersionEdit || row.isNewField)"
                    v-model="row.required"
                    @change="handleRequiredChange(row)"
                />
                <el-icon v-else-if="row.required" style="color: #67c23a"><CircleCheckFilled /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="unique" label="唯一" min-width="60" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.unique" style="color: #409EFF"><CircleCheckFilled /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="listVisible" label="列表显示" min-width="90" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.listVisible" :disabled="row.system" />
              </template>
            </el-table-column>
            <el-table-column prop="sensitiveLevel" label="敏感等级" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getSensitiveType(row.sensitiveLevel)" size="small">
                  {{ getSensitiveText(row.sensitiveLevel) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column v-if="isVersionEdit" prop="changeType" label="变更类型" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.changeType" :type="getChangeTypeTag(row.changeType)" size="small">
                  {{ getChangeTypeText(row.changeType) }}
                </el-tag>
                <span v-else style="color: #909399">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="180" align="center" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                      v-if="!row.system"
                      size="small"
                      type="primary"
                      icon="Edit"
                      @click="handleEditField(row)"
                      :disabled="isVersionEdit && !row.isNewField && !canEditOriginalField(row)"
                      class="action-btn"
                  >
                    编辑
                  </el-button>
                  <el-button
                      v-if="!row.system && (!isVersionEdit || row.isNewField)"
                      size="small"
                      type="danger"
                      icon="Delete"
                      @click="handleDeleteField(row)"
                      class="action-btn"
                  >
                    删除
                  </el-button>
                  <el-button
                      v-if="row.system || (isVersionEdit && !row.isNewField)"
                      size="small"
                      disabled
                      icon="Lock"
                      class="action-btn"
                  >
                    锁定
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 关联关系 -->
        <el-tab-pane name="relations">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Connection /></el-icon>
              <span>关联关系</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="Plus" @click="handleAddRelation">新增关联</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Connection">可视化视图</el-button>
            </div>
          </div>

          <el-table :data="relationList" border style="width: 100%" max-height="400">
            <el-table-column prop="relationName" label="关联名称" min-width="150" />
            <el-table-column prop="relationType" label="关联类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="getRelationTypeTag(row.relationType)">
                  {{ getRelationTypeText(row.relationType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="targetObject" label="关联业务对象" min-width="150" />
            <el-table-column prop="foreignKey" label="外键列名" min-width="150" />
            <el-table-column prop="cascadeDelete" label="级联删除" width="80" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.cascadeDelete" style="color: #f56c6c"><CircleCheckFilled /></el-icon>
                <span v-else style="color: #909399">-</span>
              </template>
            </el-table-column>
            <el-table-column v-if="isVersionEdit" prop="changeType" label="变更类型" min-width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.changeType" :type="getChangeTypeTag(row.changeType)" size="small">
                  {{ getChangeTypeText(row.changeType) }}
                </el-tag>
                <span v-else style="color: #909399">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" :width="isVersionEdit ? '200' : '150'" align="center">
              <template #default="{ row }">
                <el-button
                    v-if="!isVersionEdit || row.isNewRelation"
                    size="small"
                    type="primary"
                    icon="Edit"
                    @click="handleEditRelation(row)"
                >
                  编辑
                </el-button>
                <el-button
                    v-if="!isVersionEdit || row.isNewRelation"
                    size="small"
                    type="danger"
                    icon="Delete"
                    @click="handleDeleteRelation(row)"
                >
                  删除
                </el-button>
                <el-button
                    v-if="isVersionEdit && !row.isNewRelation"
                    size="small"
                    disabled
                    icon="Lock"
                >
                  锁定
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 索引管理 -->
        <el-tab-pane name="indexes">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Menu /></el-icon>
              <span>索引管理</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="Plus" @click="handleAddIndex">新增索引</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Document">推荐索引</el-button>
            </div>
          </div>

          <el-table :data="indexList" border style="width: 100%" max-height="400">
            <el-table-column prop="indexName" label="索引名称" min-width="180" />
            <el-table-column prop="indexType" label="索引类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="getIndexTypeTag(row.indexType)">
                  {{ row.indexType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="columns" label="包含字段" min-width="200">
              <template #default="{ row }">
                <div class="index-columns">
                  <el-tag v-for="col in row.columns" :key="col" size="small" style="margin-right: 6px">
                    {{ col }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button
                    v-if="!row.system && (!isVersionEdit || row.isNewIndex)"
                    size="small"
                    type="danger"
                    icon="Delete"
                    @click="handleDeleteIndex(row)"
                >
                  删除
                </el-button>
                <el-button
                    v-else
                    size="small"
                    disabled
                    icon="Lock"
                >
                  系统索引
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 字段权限 -->
        <el-tab-pane name="permissions">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Lock /></el-icon>
              <span>字段权限</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-select v-model="selectedRole" placeholder="选择角色" style="width: 200px" @change="loadRolePermissions">
                <el-option label="普通员工" value="employee" />
                <el-option label="部门经理" value="manager" />
                <el-option label="HR 专员" value="hr" />
                <el-option label="财务专员" value="finance" />
                <el-option label="系统管理员" value="admin" />
              </el-select>
              <el-button type="primary" size="default" icon="Setting" @click="handleBatchPermission">批量设置权限</el-button>
            </div>
          </div>

          <el-table :data="permissionList" border style="width: 100%" max-height="400">
            <el-table-column prop="fieldName" label="字段名称" min-width="150" />
            <el-table-column prop="fieldCode" label="字段编码" min-width="150" />
            <el-table-column prop="viewPermission" label="查看权限" width="120" align="center">
              <template #default="{ row }">
                <el-switch
                    v-model="row.viewPermission"
                    :disabled="!selectedRole"
                    @change="handlePermissionChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="editPermission" label="编辑权限" width="120" align="center">
              <template #default="{ row }">
                <el-switch
                    v-model="row.editPermission"
                    :disabled="!selectedRole"
                    @change="handlePermissionChange(row)"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 数据规则 -->
        <el-tab-pane name="rules">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Tickets /></el-icon>
              <span>数据规则</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="Plus" @click="handleAddRule">新增规则</el-button>
              <el-button size="default" icon="Select">批量启用/禁用</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Upload">导入规则</el-button>
              <el-button v-if="!isVersionEdit" size="default" icon="Download">导出规则</el-button>
            </div>
          </div>

          <el-table :data="ruleList" border style="width: 100%" max-height="400">
            <el-table-column prop="ruleName" label="规则名称" min-width="200" />
            <el-table-column prop="ruleType" label="规则类型" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="row.ruleType === 'validation' ? 'warning' : 'info'">
                  {{ row.ruleType === 'validation' ? '数据校验' : '默认值' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bindField" label="绑定字段" min-width="150" />
            <el-table-column prop="triggerTime" label="触发时机" width="150">
              <template #default="{ row }">
                <span>{{ row.triggerTime.join('、') }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status ? 'success' : 'info'">
                  {{ row.status ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" icon="Edit" @click="handleEditRule(row)">编辑</el-button>
                <el-button size="small" :type="row.status ? 'warning' : 'success'" @click="handleToggleRuleStatus(row)">
                  {{ row.status ? '禁用' : '启用' }}
                </el-button>
                <el-button v-if="!isVersionEdit || row.isNewRule" size="small" type="danger" icon="Delete" @click="handleDeleteRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 数据预览 -->
        <el-tab-pane name="preview">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><View /></el-icon>
              <span>数据预览</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-input v-model="previewSearch" placeholder="搜索" style="width: 200px" clearable />
              <el-select v-model="previewStatusFilter" placeholder="状态" style="width: 120px" clearable>
                <el-option label="草稿" value="draft" />
                <el-option label="审批中" value="approving" />
                <el-option label="已通过" value="approved" />
                <el-option label="已驳回" value="rejected" />
              </el-select>
              <el-date-picker v-model="previewDateRange" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" />
              <el-button type="primary" icon="Search">查询</el-button>
              <el-button icon="Refresh">重置</el-button>
            </div>
            <div class="toolbar-right">
              <el-button type="primary" size="default" icon="Download">导出 Excel</el-button>
              <el-button size="default" icon="Edit">在线编辑</el-button>
            </div>
          </div>

          <el-table :data="previewList" border style="width: 100%" max-height="400">
            <el-table-column prop="billNo" label="单据号" min-width="150" />
            <el-table-column prop="initiator" label="发起人" min-width="100" />
            <el-table-column prop="department" label="发起部门" min-width="120" />
            <el-table-column prop="field1" label="核心字段 1" min-width="150" />
            <el-table-column prop="field2" label="核心字段 2" min-width="150" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" icon="View" @click="handleViewDetail(row)">查看详情</el-button>
                <el-button v-if="row.status === 'draft'" size="small" type="warning" icon="Edit" @click="handleEditData(row)">编辑</el-button>
                <el-button v-if="row.status === 'draft'" size="small" type="danger" icon="Delete" @click="handleDeleteData(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-bar">
            <span>共 100 条记录</span>
            <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="100" :page-sizes="[10, 20, 50]" :page-size="10" />
          </div>
        </el-tab-pane>

        <!-- SQL 预览 -->
        <el-tab-pane name="sql">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Notebook /></el-icon>
              <span>SQL 预览</span>
            </span>
          </template>
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
        </el-tab-pane>

        <!-- 关联依赖 -->
        <el-tab-pane name="dependencies">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Share /></el-icon>
              <span>关联依赖</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="Refresh" @click="handleRefreshDependencies">刷新依赖</el-button>
              <el-button size="default" icon="Download" @click="handleExportDependencies">导出依赖报告</el-button>
            </div>
          </div>

          <el-tabs v-model="dependencyTab" class="dependency-tabs">
            <el-tab-pane label="关联表单" name="forms">
              <el-table :data="dependencyForms" border style="width: 100%" max-height="350">
                <el-table-column prop="formName" label="表单名称" min-width="200" />
                <el-table-column prop="status" label="表单状态" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                      {{ row.status === 'enabled' ? '启用' : '停用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="creator" label="创建人" min-width="120" />
                <el-table-column prop="createTime" label="创建时间" min-width="180" />
                <el-table-column label="操作" width="180" align="center">
                  <template #default="{ row }">
                    <el-button size="small" type="primary" icon="View" @click="handleViewForm(row)">查看表单</el-button>
                    <el-button size="small" type="success" icon="Right" @click="handleJumpToForm(row)">跳转到表单</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="关联流程" name="processes">
              <el-table :data="dependencyProcesses" border style="width: 100%" max-height="350">
                <el-table-column prop="processName" label="流程名称" min-width="200" />
                <el-table-column prop="status" label="流程状态" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                      {{ row.status === 'enabled' ? '启用' : '停用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="creator" label="创建人" min-width="120" />
                <el-table-column prop="createTime" label="创建时间" min-width="180" />
                <el-table-column label="操作" width="180" align="center">
                  <template #default="{ row }">
                    <el-button size="small" type="primary" icon="View" @click="handleViewProcess(row)">查看流程</el-button>
                    <el-button size="small" type="success" icon="Right" @click="handleJumpToProcess(row)">跳转到流程</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="关联报表" name="reports">
              <el-empty description="暂无关联报表" />
            </el-tab-pane>

            <el-tab-pane label="关联接口" name="apis">
              <el-empty description="暂无关联接口" />
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>

        <!-- 版本历史 -->
        <el-tab-pane name="versions">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><Clock /></el-icon>
              <span>版本历史</span>
            </span>
          </template>
          <div class="tab-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" size="default" icon="View" @click="handleVersionCompare">版本对比</el-button>
              <el-button size="default" type="warning" icon="RefreshLeft" @click="handleRollback">回滚到选中版本</el-button>
            </div>
          </div>

          <el-table :data="versionList" border style="width: 100%" max-height="400" :row-class-name="versionRowClassName" @selection-change="handleVersionSelection">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="version" label="版本号" width="100" />
            <el-table-column prop="publisher" label="发布人" min-width="120" />
            <el-table-column prop="publishTime" label="发布时间" min-width="180" />
            <el-table-column prop="description" label="变更说明" min-width="250" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" align="center">
              <template #default="{ row }">
                <el-button size="small" type="primary" icon="View" @click="handleViewVersion(row)">查看详情</el-button>
                <el-button size="small" icon="Compare" @click="handleCompareWithPrevious(row)">对比上一版本</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 版本差异对比标签（仅版本编辑模式显示） -->
        <el-tab-pane v-if="isVersionEdit" name="diff">
          <template #label>
            <span class="tab-label">
              <el-icon class="tab-icon"><ScaleToOriginal /></el-icon>
              <span>版本差异对比</span>
            </span>
          </template>
          <div class="diff-toolbar">
            <el-button type="primary" size="default" icon="Download" @click="handleExportDiff">导出差异报告</el-button>
            <el-button size="default" icon="Refresh" @click="handleRefreshDiff">刷新对比</el-button>
          </div>
          <el-table :data="diffList" border style="width: 100%" max-height="400" :row-class-name="diffRowClassName">
            <el-table-column prop="category" label="对比维度" width="120" />
            <el-table-column prop="fieldName" label="字段/项名称" min-width="150" />
            <el-table-column prop="originalValue" :label="'原版本 V' + originalVersion" min-width="200" show-overflow-tooltip />
            <el-table-column prop="newValue" :label="'新版本 V' + newVersion" min-width="200" show-overflow-tooltip />
            <el-table-column prop="changeType" label="差异类型" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getChangeTypeTag(row.changeType)" size="small">
                  {{ getChangeTypeText(row.changeType) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="diffList.length === 0" description="暂无差异，当前新版本与原版本配置一致" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button v-if="isVersionEdit" @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button v-if="isVersionEdit" type="info" @click="handleViewDiff" icon="View">查看差异</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving" icon="Check">保存</el-button>
        <el-button
            v-if="formData.status === 'draft'"
            type="success"
            @click="handlePublish"
            :loading="publishing"
            icon="CircleCheck"
        >
          保存并发布
        </el-button>
      </div>
    </template>

    <!-- 字段编辑弹窗 -->
    <el-dialog
        v-model="fieldDialogVisible"
        width="550px"
        :close-on-click-modal="false"
        @close="handleFieldDialogClose"
        class="field-dialog"
        append-to-parent
    >
      <div class="field-dialog-header">
        <el-icon class="header-icon"><Document /></el-icon>
        <div class="header-text">
          <div class="header-title">{{ fieldDialogTitle }}</div>
          <div class="header-subtitle">配置字段属性</div>
        </div>
      </div>

      <el-form
          ref="fieldFormRef"
          :model="fieldForm"
          :rules="fieldRules"
          label-width="110px"
          class="field-form"
      >
        <el-form-item label="字段名称" prop="fieldName">
          <el-input v-model="fieldForm.fieldName" placeholder="如：申请人" />
        </el-form-item>

        <el-form-item label="数据库列名" prop="fieldCode">
          <el-input v-model="fieldForm.fieldCode" placeholder="如：applicant" :disabled="editingField?.system || (isVersionEdit && !editingField?.isNewField)" />
        </el-form-item>

        <el-form-item label="字段类型" prop="dataType">
          <el-select v-model="fieldForm.dataType" style="width: 100%" :disabled="isVersionEdit && !editingField?.isNewField">
            <el-option label="BIGINT - 长整型" value="BIGINT" />
            <el-option label="VARCHAR(64) - 字符串 (64)" value="VARCHAR(64)" />
            <el-option label="VARCHAR(128) - 字符串 (128)" value="VARCHAR(128)" />
            <el-option label="VARCHAR(255) - 字符串 (255)" value="VARCHAR(255)" />
            <el-option label="TEXT - 长文本" value="TEXT" />
            <el-option label="DATETIME - 日期时间" value="DATETIME" />
            <el-option label="DATE - 日期" value="DATE" />
            <el-option label="INT - 整型" value="INT" />
            <el-option label="DECIMAL(10,2) - 金额" value="DECIMAL(10,2)" />
            <el-option label="BOOLEAN - 布尔值" value="BOOLEAN" />
          </el-select>
        </el-form-item>

        <el-form-item label="长度">
          <el-input-number
              v-model="fieldForm.length"
              :min="1"
              :max="9999"
              :disabled="!isLengthEditable || (isVersionEdit && !editingField?.isNewField)"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="默认值">
          <el-input v-model="fieldForm.defaultValue" placeholder="字段默认值" />
        </el-form-item>

        <el-form-item label="字段属性">
          <el-space>
            <el-checkbox v-model="fieldForm.required">必填</el-checkbox>
            <el-checkbox v-model="fieldForm.unique" :disabled="isVersionEdit && !editingField?.isNewField">唯一</el-checkbox>
            <el-checkbox v-model="fieldForm.listVisible">列表显示</el-checkbox>
          </el-space>
        </el-form-item>

        <el-form-item label="敏感等级">
          <el-radio-group v-model="fieldForm.sensitiveLevel">
            <el-radio label="normal">普通</el-radio>
            <el-radio label="general">一般敏感</el-radio>
            <el-radio label="high">高度敏感</el-radio>
            <el-radio label="core">核心敏感</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="field-dialog-footer">
          <el-button @click="fieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFieldConfirm" :loading="fieldLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check, CircleCheck, CircleCheckFilled, Document, Setting, Plus, Upload, Download,
  Edit, Delete, View, Lock, Connection, Top, Menu, Tickets, Notebook, Share, Clock, ScaleToOriginal
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const fieldFormRef = ref(null)
const saving = ref(false)
const publishing = ref(false)
const activeTab = ref('fields')
const selectedRole = ref('')
const versionDescription = ref('')

// 版本信息
const originalVersion = ref('1.0')
const newVersion = ref('1.1')
const currentTime = ref(new Date().toLocaleString('zh-CN'))

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  tableName: '',
  domain: '',
  remark: '',
  status: 'draft'
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入业务对象名称', trigger: 'blur' }
  ],
  tableName: [
    { required: true, message: '请输入数据库表名', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请选择所属业务域', trigger: 'change' }
  ]
}

// 字段列表
const fieldList = ref([
  { id: 1, fieldName: '主键 ID', fieldCode: 'id', dataType: 'BIGINT', length: 20, required: true, unique: true, listVisible: false, sensitiveLevel: 'normal', system: true, isNewField: false },
  { id: 2, fieldName: '单据编号', fieldCode: 'bill_no', dataType: 'VARCHAR(64)', length: 64, required: true, unique: false, listVisible: true, sensitiveLevel: 'normal', system: true, isNewField: false },
  { id: 3, fieldName: '申请人', fieldCode: 'applicant', dataType: 'VARCHAR(64)', length: 64, required: true, unique: false, listVisible: true, sensitiveLevel: 'normal', system: false, isNewField: false },
  { id: 4, fieldName: '申请部门', fieldCode: 'apply_department', dataType: 'VARCHAR(64)', length: 64, required: false, unique: false, listVisible: true, sensitiveLevel: 'normal', system: false, isNewField: false },
  { id: 5, fieldName: '申请日期', fieldCode: 'apply_date', dataType: 'DATE', length: null, required: true, unique: false, listVisible: true, sensitiveLevel: 'normal', system: false, isNewField: false },
  { id: 6, fieldName: '备注', fieldCode: 'remark', dataType: 'TEXT', length: null, required: false, unique: false, listVisible: false, sensitiveLevel: 'normal', system: false, isNewField: false }
])

// 关联关系列表
const relationList = ref([
  { id: 1, relationName: '申请人信息', relationType: 'many-to-one', targetObject: '员工信息', foreignKey: 'applicant', cascadeDelete: false, isNewRelation: false }
])

// 索引列表
const indexList = ref([
  { id: 1, indexName: 'PRIMARY', indexType: 'PRIMARY', columns: ['id'], system: true, isNewIndex: false },
  { id: 2, indexName: 'idx_bill_no', indexType: 'NORMAL', columns: ['bill_no'], system: true, isNewIndex: false }
])

// 权限列表
const permissionList = ref([
  { fieldCode: 'applicant', fieldName: '申请人', viewPermission: true, editPermission: false, originalViewPermission: true, originalEditPermission: false },
  { fieldCode: 'apply_department', fieldName: '申请部门', viewPermission: true, editPermission: true, originalViewPermission: true, originalEditPermission: true }
])

// 差异列表
const diffList = ref([])

// 数据规则列表
const ruleList = ref([
  { id: 1, ruleName: '报销金额不能超过 10000', ruleType: 'validation', bindField: 'amount', triggerTime: ['表单保存时', '流程提交时'], status: true, isNewRule: false },
  { id: 2, ruleName: '身份证号格式校验', ruleType: 'validation', bindField: 'idCard', triggerTime: ['表单保存时'], status: true, isNewRule: false },
  { id: 3, ruleName: '默认发起人为当前用户', ruleType: 'default', bindField: 'initiator', triggerTime: ['表单保存时'], status: true, isNewRule: false }
])

// 数据预览列表
const previewList = ref([
  { billNo: 'QJ20240115001', initiator: '张三', department: '技术部', field1: '事假', field2: '2 天', status: 'approved' },
  { billNo: 'QJ20240115002', initiator: '李四', department: '财务部', field1: '年假', field2: '5 天', status: 'approving' },
  { billNo: 'QJ20240115003', initiator: '王五', department: '人事部', field1: '病假', field2: '3 天', status: 'draft' }
])

// SQL 脚本
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

// 关联依赖
const dependencyTab = ref('forms')
const dependencyForms = ref([
  { formName: '请假申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-10 09:00:00' },
  { formName: '加班申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-12 14:30:00' }
])
const dependencyProcesses = ref([
  { processName: '请假审批流程', status: 'enabled', creator: '流程管理员', createTime: '2024-01-11 10:00:00' }
])

// 版本历史
const versionList = ref([
  { version: '1.1', publisher: '当前用户', publishTime: '2024-01-15 10:00:00', description: '新增附件字段，修改请假事由为富文本', status: 'draft' },
  { version: '1.0', publisher: '张三', publishTime: '2024-01-10 09:00:00', description: '初始版本发布', status: 'published' }
])
const selectedVersions = ref([])

// 字段编辑弹窗
const fieldDialogVisible = ref(false)
const fieldLoading = ref(false)
const fieldDialogTitle = ref('新增字段')
const editingField = ref(null)

const fieldForm = reactive({
  fieldName: '',
  fieldCode: '',
  dataType: 'VARCHAR(64)',
  length: null,
  defaultValue: '',
  required: false,
  unique: false,
  listVisible: false,
  sensitiveLevel: 'normal'
})

const fieldRules = {
  fieldName: [
    { required: true, message: '请输入字段名称', trigger: 'blur' }
  ],
  fieldCode: [
    { required: true, message: '请输入数据库列名', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择字段类型', trigger: 'change' }
  ]
}

// 判断长度字段是否可编辑
const isLengthEditable = computed(() => {
  const editableTypes = ['VARCHAR(64)', 'VARCHAR(128)', 'VARCHAR(255)', 'BIGINT', 'INT']
  return editableTypes.includes(fieldForm.dataType)
})

// 判断原版本字段是否可以编辑
const canEditOriginalField = (row) => {
  return false
}

// 监听弹窗打开，初始化数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    initForm()
  }
})

// 处理弹窗关闭事件
const handleDialogClose = () => {
  if (!props.isVersionEdit) {
    resetForm()
  }
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  fieldFormRef.value?.resetFields()
}

// 初始化数据
const initForm = () => {
  activeTab.value = 'fields'
  versionDescription.value = ''
  if (props.data) {
    formData.id = props.data.id
    formData.name = props.data.name
    formData.tableName = props.data.tableName
    formData.domain = props.data.domain
    formData.remark = props.data.remark || ''
    formData.status = props.data.status || 'draft'

    if (props.isVersionEdit) {
      originalVersion.value = props.data.version || '1.0'
      const versionParts = originalVersion.value.split('.')
      newVersion.value = `${versionParts[0]}.${parseInt(versionParts[1] || 0) + 1}`
      currentTime.value = new Date().toLocaleString('zh-CN')

      fieldList.value.forEach(field => {
        field.isNewField = false
        field.changeType = null
      })
      relationList.value.forEach(rel => {
        rel.isNewRelation = false
        rel.changeType = null
      })
      indexList.value.forEach(idx => {
        idx.isNewIndex = false
        idx.changeType = null
      })

      permissionList.value.forEach(perm => {
        perm.originalViewPermission = perm.viewPermission
        perm.originalEditPermission = perm.editPermission
      })

      generateDiffList()
    }
  }
}

// 生成差异列表
const generateDiffList = () => {
  diffList.value = []

  fieldList.value.forEach(field => {
    if (field.isNewField) {
      diffList.value.push({
        category: '字段定义',
        fieldName: field.fieldName,
        originalValue: '无此字段',
        newValue: `新增字段"${field.fieldName}"，类型${field.dataType}，长度${field.length || '-'}`,
        changeType: '新增'
      })
    }
  })

  relationList.value.forEach(rel => {
    if (rel.isNewRelation) {
      diffList.value.push({
        category: '关联关系',
        fieldName: rel.relationName,
        originalValue: '无此关联',
        newValue: `新增关联"${rel.relationName}"`,
        changeType: '新增'
      })
    }
  })

  permissionList.value.forEach(perm => {
    if (perm.viewPermission !== perm.originalViewPermission || perm.editPermission !== perm.originalEditPermission) {
      diffList.value.push({
        category: '字段权限',
        fieldName: perm.fieldName,
        originalValue: `查看:${perm.originalViewPermission ? '允许' : '禁止'}, 编辑:${perm.originalEditPermission ? '允许' : '禁止'}`,
        newValue: `查看:${perm.viewPermission ? '允许' : '禁止'}, 编辑:${perm.editPermission ? '允许' : '禁止'}`,
        changeType: '修改'
      })
    }
  })
}

// 业务域变更处理
const handleDomainChange = (value) => {
  if (props.isVersionEdit) {
    ElMessageBox.confirm(
        '版本编辑模式下不支持跨域修改，是否恢复原业务域？',
        '提示',
        {
          confirmButtonText: '恢复',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      formData.domain = props.data.domain
    }).catch(() => {})
  }
}

// 必填属性变更处理
const handleRequiredChange = (row) => {
  if (props.isVersionEdit && !row.isNewField && row.required) {
    ElMessageBox.prompt('从非必填改为必填，请设置该字段的默认值', '设置默认值', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '默认值不能为空'
    }).then(({ value }) => {
      row.defaultValue = value
    }).catch(() => {
      row.required = false
    })
  }
}

const handleClose = () => {
  if (props.isVersionEdit) {
    ElMessageBox.confirm(
        '放弃当前所有修改，不保留新版本草稿？',
        '取消确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      resetForm()
      emit('update:modelValue', false)
    }).catch(() => {})
  } else {
    resetForm()
    emit('update:modelValue', false)
  }
}

const handleSave = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    setTimeout(() => {
      saving.value = false
      ElMessage.success('保存成功')
      emit('confirm', { ...formData, action: 'save', isVersionEdit: props.isVersionEdit })
      handleClose()
    }, 1000)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

const handlePublish = async () => {
  if (props.isVersionEdit) {
    if (!versionDescription.value.trim()) {
      ElMessage.warning('请填写版本说明')
      return
    }

    const highRiskChanges = diffList.value.filter(item => item.changeType === '修改')
    if (highRiskChanges.length > 0) {
      ElMessage.warning('存在高风险改动，请仔细核对后再发布')
      return
    }
  }

  try {
    await formRef.value.validate()
    publishing.value = true

    if (props.isVersionEdit) {
      ElMessageBox.confirm(
          `新版本V${newVersion.value}发布后，新发起的单据将使用新版本，历史单据仍绑定原版本V${originalVersion.value}，是否确认发布？`,
          '发布确认',
          {
            confirmButtonText: '确定发布',
            cancelButtonText: '取消',
            type: 'success'
          }
      ).then(() => {
        doPublish()
      }).catch(() => {
        publishing.value = false
      })
    } else {
      doPublish()
    }
  } catch (error) {
    console.error('发布失败:', error)
  }
}

const doPublish = () => {
  setTimeout(() => {
    publishing.value = false
    ElMessage.success('发布成功')
    emit('confirm', { ...formData, action: 'publish', isVersionEdit: props.isVersionEdit, version: newVersion.value })
    handleClose()
  }, 1500)
}

const handleSaveDraft = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('草稿保存成功')
    emit('confirm', { ...formData, action: 'save_draft', isVersionEdit: true, version: newVersion.value })
  }, 1000)
}

const handleViewDiff = () => {
  activeTab.value = 'diff'
  generateDiffList()
}

const handleExportDiff = () => {
  ElMessage.info('导出差异报告功能开发中...')
}

const handleRefreshDiff = () => {
  generateDiffList()
  ElMessage.success('差异对比已刷新')
}

const diffRowClassName = ({ row }) => {
  if (row.changeType === '新增') return 'diff-row-add'
  if (row.changeType === '修改') return 'diff-row-modify'
  if (row.changeType === '删除') return 'diff-row-delete'
  return ''
}

const handleAddField = () => {
  fieldDialogTitle.value = '新增字段'
  editingField.value = null
  resetFieldForm()
  fieldDialogVisible.value = true
}

const handleEditField = (row) => {
  fieldDialogTitle.value = '编辑字段'
  editingField.value = row
  fieldForm.fieldName = row.fieldName
  fieldForm.fieldCode = row.fieldCode
  fieldForm.dataType = row.dataType
  fieldForm.defaultValue = row.defaultValue || ''
  fieldForm.required = row.required
  fieldForm.unique = row.unique
  fieldForm.listVisible = row.listVisible
  fieldForm.sensitiveLevel = row.sensitiveLevel
  fieldForm.length = row.length
  fieldDialogVisible.value = true
}

const handleDeleteField = (row) => {
  ElMessageBox.confirm(
      `确定要删除字段"${row.fieldName}"吗？`,
      '删除确认',
      { type: 'warning' }
  ).then(() => {
    fieldList.value = fieldList.value.filter(f => f.id !== row.id)
    ElMessage.success('删除成功')
    if (props.isVersionEdit) {
      generateDiffList()
    }
  }).catch(() => {})
}

const handleFieldDialogClose = () => {
  fieldFormRef.value?.resetFields()
  editingField.value = null
}

const handleFieldConfirm = async () => {
  try {
    await fieldFormRef.value.validate()
    fieldLoading.value = true

    setTimeout(() => {
      fieldLoading.value = false

      if (editingField.value) {
        const index = fieldList.value.findIndex(f => f.id === editingField.value.id)
        if (index !== -1) {
          fieldList.value[index] = {
            ...fieldList.value[index],
            fieldName: fieldForm.fieldName,
            fieldCode: fieldForm.fieldCode,
            dataType: fieldForm.dataType,
            length: fieldForm.length,
            defaultValue: fieldForm.defaultValue,
            required: fieldForm.required,
            unique: fieldForm.unique,
            listVisible: fieldForm.listVisible,
            sensitiveLevel: fieldForm.sensitiveLevel
          }
        }
        ElMessage.success('修改成功')
      } else {
        const newId = Math.max(...fieldList.value.map(f => f.id), 0) + 1
        fieldList.value.push({
          id: newId,
          fieldName: fieldForm.fieldName,
          fieldCode: fieldForm.fieldCode,
          dataType: fieldForm.dataType,
          length: fieldForm.length,
          defaultValue: fieldForm.defaultValue,
          required: fieldForm.required,
          unique: fieldForm.unique,
          listVisible: fieldForm.listVisible,
          sensitiveLevel: fieldForm.sensitiveLevel,
          system: false,
          isNewField: true
        })
        ElMessage.success('新增成功')
      }

      fieldDialogVisible.value = false
      if (props.isVersionEdit) {
        generateDiffList()
      }
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

const resetFieldForm = () => {
  fieldForm.fieldName = ''
  fieldForm.fieldCode = ''
  fieldForm.dataType = 'VARCHAR(64)'
  fieldForm.length = null
  fieldForm.defaultValue = ''
  fieldForm.required = false
  fieldForm.unique = false
  fieldForm.listVisible = false
  fieldForm.sensitiveLevel = 'normal'
}

const handleAddRelation = () => {
  const newId = Math.max(...relationList.value.map(r => r.id), 0) + 1
  relationList.value.push({
    id: newId,
    relationName: '新关联',
    relationType: 'many-to-one',
    targetObject: '待选择',
    foreignKey: '',
    cascadeDelete: false,
    isNewRelation: props.isVersionEdit
  })
  if (props.isVersionEdit) {
    generateDiffList()
  }
}

const handleEditRelation = (row) => {
  ElMessage.info('编辑关联功能开发中...')
}

const handleDeleteRelation = (row) => {
  ElMessageBox.confirm(
      `确定要删除关联"${row.relationName}"吗？`,
      '删除确认',
      { type: 'warning' }
  ).then(() => {
    relationList.value = relationList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
    if (props.isVersionEdit) {
      generateDiffList()
    }
  }).catch(() => {})
}

const handleAddIndex = () => {
  const newId = Math.max(...indexList.value.map(i => i.id), 0) + 1
  indexList.value.push({
    id: newId,
    indexName: 'idx_new',
    indexType: 'NORMAL',
    columns: [],
    system: false,
    isNewIndex: props.isVersionEdit
  })
  if (props.isVersionEdit) {
    generateDiffList()
  }
}

const handleDeleteIndex = (row) => {
  ElMessageBox.confirm(
      `确定要删除索引"${row.indexName}"吗？`,
      '删除确认',
      { type: 'warning' }
  ).then(() => {
    indexList.value = indexList.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const loadRolePermissions = () => {
  if (selectedRole.value) {
    ElMessage.success(`已加载${selectedRole.value}的权限配置`)
  }
}

const handlePermissionChange = (row) => {
  if (props.isVersionEdit) {
    generateDiffList()
  }
}

const handleBatchPermission = () => {
  ElMessage.info('批量设置权限功能开发中...')
}

const getSensitiveType = (level) => {
  const types = {
    normal: 'info',
    general: 'warning',
    high: 'orange',
    core: 'danger'
  }
  return types[level] || 'info'
}

const getSensitiveText = (level) => {
  const texts = {
    normal: '普通',
    general: '一般敏感',
    high: '高度敏感',
    core: '核心敏感'
  }
  return texts[level] || level
}

const getRelationTypeTag = (type) => {
  const tags = {
    'one-to-one': '',
    'one-to-many': 'success',
    'many-to-one': 'warning'
  }
  return tags[type] || ''
}

const getRelationTypeText = (type) => {
  const texts = {
    'one-to-one': '一对一',
    'one-to-many': '一对多',
    'many-to-one': '多对一'
  }
  return texts[type] || type
}

const getIndexTypeTag = (type) => {
  const tags = {
    'PRIMARY': 'danger',
    'UNIQUE': 'warning',
    'NORMAL': 'info'
  }
  return tags[type] || 'info'
}

const getChangeTypeTag = (type) => {
  const tags = {
    '新增': 'success',
    '修改': 'warning',
    '删除': 'danger'
  }
  return tags[type] || 'info'
}

// 数据规则相关
const handleAddRule = () => {
  ElMessage.info('新增规则功能开发中...')
}

const handleEditRule = (row) => {
  ElMessage.info('编辑规则功能开发中...')
}

const handleToggleRuleStatus = (row) => {
  row.status = !row.status
  ElMessage.success(row.status ? '已启用' : '已禁用')
}

const handleDeleteRule = (row) => {
  ElMessageBox.confirm(`确定要删除规则"${row.ruleName}"吗？`, '删除确认', { type: 'warning' }).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 数据预览相关
const previewSearch = ref('')
const previewStatusFilter = ref('')
const previewDateRange = ref(null)

const getStatusType = (status) => {
  const types = { draft: 'info', approving: 'warning', approved: 'success', rejected: 'danger', published: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', approving: '审批中', approved: '已通过', rejected: '已驳回', published: '已发布' }
  return texts[status] || status
}

const handleViewDetail = (row) => {
  ElMessage.info('查看详情功能开发中...')
}

const handleEditData = (row) => {
  ElMessage.info('在线编辑功能开发中...')
}

const handleDeleteData = (row) => {
  ElMessageBox.confirm(`确定要删除数据"${row.billNo}"吗？`, '删除确认', { type: 'warning' }).then(() => {
    previewList.value = previewList.value.filter(d => d.billNo !== row.billNo)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// SQL 预览相关
const handleCopySql = () => {
  navigator.clipboard.writeText(sqlScript.value).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const handleDownloadSql = () => {
  ElMessage.info('下载 SQL 文件功能开发中...')
}

// 关联依赖相关
const handleRefreshDependencies = () => {
  ElMessage.success('依赖关系已刷新')
}

const handleExportDependencies = () => {
  ElMessage.info('导出依赖报告功能开发中...')
}

const handleViewForm = (row) => {
  ElMessage.info('查看表单功能开发中...')
}

const handleJumpToForm = (row) => {
  ElMessage.info('跳转到表单功能开发中...')
}

const handleViewProcess = (row) => {
  ElMessage.info('查看流程功能开发中...')
}

const handleJumpToProcess = (row) => {
  ElMessage.info('跳转到流程功能开发中...')
}

// 版本历史相关
const handleVersionSelection = (selection) => {
  selectedVersions.value = selection
}

const versionRowClassName = ({ row }) => {
  return row.status === 'published' ? 'version-row-latest' : ''
}

const handleVersionCompare = () => {
  if (selectedVersions.value.length !== 2) {
    ElMessage.warning('请选择两个版本进行对比')
    return
  }
  ElMessage.info('版本对比功能开发中...')
}

const handleRollback = () => {
  if (selectedVersions.value.length !== 1) {
    ElMessage.warning('请选择一个版本进行回滚')
    return
  }
  ElMessageBox.confirm(`回滚到版本${selectedVersions.value[0].version}将撤销之后的所有变更，此操作不可恢复！`, '回滚确认', { type: 'warning' }).then(() => {
    ElMessage.success('回滚成功')
  }).catch(() => {})
}

const handleViewVersion = (row) => {
  ElMessage.info('查看版本详情功能开发中...')
}

const handleCompareWithPrevious = (row) => {
  ElMessage.info('对比上一版本功能开发中...')
}
</script>

<style scoped lang="scss">
.edit-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .header-icon {
      font-size: 32px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .version-header {
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .version-header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;

      .header-icon {
        font-size: 32px;
        color: #fff;
        flex-shrink: 0;
        margin-top: 4px;
      }

      .header-text {
        flex: 1;

        .header-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
        }

        .version-info-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          flex-wrap: wrap;

          .divider {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }
    }
  }

  .dialog-content {
    .version-description-item {
      margin-bottom: 24px;

      :deep(.el-form-item__label) {
        font-weight: 600;
        color: #303133;
      }

      :deep(.el-form-item__content) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }

      .version-textarea {
        width: 100%;
      }

      .version-tip {
        display: block;
        font-size: 12px;
        color: #f56c6c;
        margin-top: 6px;
        font-weight: 500;
      }
    }

    .remark-item {
      :deep(.el-form-item__content) {
        width: 100%;
      }

      .remark-textarea {
        width: 100%;
      }
    }
  }

  .basic-info {
    margin-bottom: 20px;
    padding: 0 8px;

    .basic-form {
      .form-row {
        display: flex;
        gap: 24px;
        flex-wrap: nowrap;
        align-items: flex-start;

        :deep(.el-form-item) {
          margin-bottom: 18px;
          flex-shrink: 0;

          .el-form-item__label {
            white-space: nowrap;
          }
        }

        .domain-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          :deep(.el-form-item__content) {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }
        }

        .table-name-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;

          :deep(.el-form-item__content) {
            display: flex;
            align-items: flex-start;
            gap: 8px;
          }
        }

        .table-name-wrapper {
          position: relative;
          display: inline-block;

          .table-prefix-static {
            font-weight: 600;
            color: #667eea;
            font-size: 14px;
            margin-right: 2px;
          }

          .locked-input {
            :deep(.el-input__wrapper) {
              background-color: #f5f7fa;
              cursor: not-allowed;
            }

            .lock-icon {
              color: #f56c6c;
              cursor: pointer;

              &:hover {
                color: #f78989;
              }
            }
          }
        }

        .tip-icon {
          color: #909399;
          font-size: 16px;
          margin-top: 10px;
          cursor: pointer;

          &:hover {
            color: #606266;
          }
        }
      }
    }
  }

  .edit-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 20px;
      background: linear-gradient(to right, #f8f9fa, #ffffff);
      border-radius: 8px 8px 0 0;
      padding: 4px 8px 0;
      border-bottom: 2px solid #e4e7ed;

      .el-tabs__nav-wrap {
        padding: 0 4px;
      }

      .el-tabs__item {
        font-size: 14px;
        font-weight: 500;
        padding: 12px 20px;
        color: #606266;
        transition: all 0.3s ease;
        border-radius: 6px 6px 0 0;
        margin: 0 2px;
        position: relative;
        &:hover {
          color: #667eea;
          background-color: rgba(102, 126, 234, 0.05);
        }

        &.is-active {
          color: #667eea;
          background-color: #ffffff;
          font-weight: 600;
          box-shadow: 0 -2px 8px rgba(102, 126, 234, 0.15);

          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to right, #667eea, #764ba2);
          }

          .tab-label {
            .el-icon {
              color: #667eea;
              transform: scale(1.1);
            }
          }
        }
      }

      .el-tabs__active-bar {
        display: none;
      }
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      .el-icon {
        font-size: 16px;
        transition: all 0.3s ease;
      }
    }

    .tab-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .toolbar-left {
        display: flex;
        gap: 12px;
      }

      .toolbar-right {
        flex: 1;
        margin-left: 16px;

        .version-tip {
          :deep(.el-alert__content) {
            width: 100%;
          }
        }
      }
    }

    .el-table {
      .el-table__header th {
        word-break: keep-all;
        white-space: nowrap;
        background-color: #fafafa !important;
        padding: 12px 10px;
      }

      .el-table__body td {
        padding: 10px;
        vertical-align: middle;
      }

      .el-table__row {
        height: 46px;
      }

      .action-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        white-space: nowrap;
        flex-wrap: nowrap;

        .action-btn {
          margin: 0;
          padding: 5px 10px;
        }
      }

      .new-icon {
        margin-left: 4px;
      }
    }

    .index-columns {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .diff-toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    :deep(.diff-row-add) {
      background-color: #f0f9eb !important;
    }

    :deep(.diff-row-modify) {
      background-color: #fdf6ec !important;
    }

    :deep(.diff-row-delete) {
      background-color: #fef0f0 !important;
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
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

  .dependency-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }
  }

  :deep(.version-row-latest) {
    background-color: #f0f9eb !important;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}

.field-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .field-dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .header-icon {
      font-size: 28px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .field-form {
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 18px;
    }
  }

  .field-dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
