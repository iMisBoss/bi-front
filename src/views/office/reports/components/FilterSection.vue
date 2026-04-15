<template>
  <el-card shadow="hover" class="filter-section">
    <template #header>
      <div class="filter-header">
        <span>全局筛选条件</span>
        <div class="filter-actions">
          <el-button link type="primary" @click="$emit('save-template')">保存模板</el-button>
          <el-dropdown @command="$emit('load-template', $event)" v-if="templates && templates.length > 0">
            <el-button link type="primary">加载模板<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    v-for="template in templates"
                    :key="template.name"
                    :command="template"
                >
                  {{ template.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-text v-else link type="info">加载模板</el-text>
        </div>
      </div>
    </template>

    <el-form :model="filterForm" size="default" class="compact-form" inline>
      <el-form-item label="发起时间">
        <el-date-picker
            v-model="filterForm.startTime"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
        />
        <span class="separator">至</span>
        <el-date-picker
            v-model="filterForm.endTime"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
        />
      </el-form-item>

      <el-form-item label="完成时间" v-show="showAdvanced">
        <el-date-picker
            v-model="filterForm.completeStartTime"
            type="datetime"
            placeholder="开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
        />
        <span class="separator">至</span>
        <el-date-picker
            v-model="filterForm.completeEndTime"
            type="datetime"
            placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 180px"
        />
      </el-form-item>

      <el-form-item label="流程状态" v-show="showAdvanced">
        <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="草稿" value="draft" />
          <el-option label="审批中" value="approving" />
          <el-option label="已通过" value="completed" />
          <el-option label="已驳回" value="rejected" />
          <el-option label="已撤销" value="cancelled" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </el-form-item>

      <el-form-item label="流程模板" v-show="showAdvanced">
        <el-select v-model="filterForm.templates" placeholder="全流程" multiple collapse-tags style="width: 140px">
          <el-option label="请假" value="leave" />
          <el-option label="报销" value="expense" />
          <el-option label="采购" value="purchase" />
          <el-option label="用章" value="seal" />
          <el-option label="会议" value="meeting" />
          <el-option label="公文" value="document" />
        </el-select>
      </el-form-item>

      <el-form-item label="流程编号" v-show="showAdvanced">
        <el-input v-model="filterForm.processNo" placeholder="精准查询" clearable style="width: 140px" />
      </el-form-item>

      <el-form-item label="发起人" v-show="showAdvanced">
        <el-input v-model="filterForm.initiator" placeholder="姓名/工号" clearable style="width: 140px" />
      </el-form-item>

      <el-form-item label="审批人" v-show="showAdvanced">
        <el-input v-model="filterForm.approver" placeholder="当前/历史" clearable style="width: 140px" />
      </el-form-item>

      <el-form-item label="组织架构" v-show="showAdvanced">
        <el-select v-model="filterForm.departments" placeholder="全公司" multiple collapse-tags style="width: 160px">
          <el-option label="技术研发部" value="tech" />
          <el-option label="财务部" value="finance" />
          <el-option label="行政部" value="admin" />
          <el-option label="人力资源部" value="hr" />
        </el-select>
      </el-form-item>

      <el-form-item label="异常流程" v-show="showAdvanced">
        <el-select v-model="filterForm.abnormalType" placeholder="全部" multiple collapse-tags style="width: 140px">
          <el-option label="超时审批" value="timeout" />
          <el-option label="无附件" value="no_attachment" />
          <el-option label="驳回重提" value="reject" />
          <el-option label="越级审批" value="skip_level" />
        </el-select>
      </el-form-item>

      <el-form-item label="数据范围" v-show="showAdvanced">
        <el-select v-model="filterForm.dataScope" placeholder="全部数据" style="width: 140px">
          <el-option label="全部数据" value="all" />
          <el-option label="涉密流程" value="confidential" />
          <el-option label="普通流程" value="normal" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="$emit('filter-change')" icon="Search">查询</el-button>
        <el-button @click="toggleAdvanced" v-if="!showAdvanced">
          更多条件<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <el-button @click="toggleAdvanced" v-else>
          收起条件<el-icon class="el-icon--right"><ArrowUp /></el-icon>
        </el-button>
        <el-button @click="$emit('reset')" icon="Refresh">重置筛选</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  filterForm: {
    type: Object,
    required: true
  },
  templates: {
    type: Array,
    default: () => []
  }
})

defineEmits(['filter-change', 'reset', 'save-template', 'load-template'])

const showAdvanced = ref(false)

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}
</script>

<style scoped lang="scss">
.filter-section {
  margin-bottom: 12px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-card__body) {
    padding: 16px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 14px;

    .filter-actions {
      display: flex;
      gap: 8px;
    }
  }

  .compact-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 12px;
    }

    :deep(.el-form-item__label) {
      font-size: 13px;
      padding-right: 4px;
    }

    :deep(.el-input),
    :deep(.el-select) {
      font-size: 13px;
    }
  }

  .separator {
    margin: 0 6px;
    font-size: 13px;
    color: #909399;
  }
}
</style>
