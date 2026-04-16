<template>
  <div class="personal-contacts">
    <!-- 顶部操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
              v-model="searchKeyword"
              placeholder="搜索姓名/拼音/公司/手机号"
              :prefix-icon="Search"
              clearable
              style="width: 280px"
              @input="handleSearch"
          />
          <el-radio-group v-model="viewMode" size="small" style="margin-left: 12px">
            <el-radio-button value="card">卡片</el-radio-button>
            <el-radio-button value="list">列表</el-radio-button>
          </el-radio-group>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Plus" size="small" @click="showAddDialog">添加联系人</el-button>
          <el-button :icon="Upload" size="small" @click="handleImport">导入</el-button>
          <el-button type="success" :icon="Download" size="small" @click="handleExport">导出</el-button>
          <el-button :icon="Refresh" size="small" @click="loadData">刷新</el-button>
        </div>
      </div>
    </el-card>

    <!-- Tab栏 -->
    <el-tabs v-model="activeTab" class="tabs-bar">
      <el-tab-pane label="我的常用联系人" name="favorites" />
      <el-tab-pane label="外部联系人" name="external" />
    </el-tabs>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧分组栏 -->
      <div class="left-panel">
        <el-card shadow="never" class="group-panel">
          <el-tree
              :data="currentGroups"
              :props="treeProps"
              node-key="key"
              highlight-current
              @node-click="handleGroupClick"
          >
            <template #default="{ node, data }">
              <span class="group-node">
                <el-icon class="group-icon"><component :is="data.icon" /></el-icon>
                <span class="group-label">{{ node.label }}</span>
                <el-tag v-if="data.count" size="small" type="info" effect="plain" class="group-count">{{ data.count }}</el-tag>
              </span>
            </template>
          </el-tree>
        </el-card>
      </div>

      <!-- 中间联系人展示区 -->
      <div class="center-panel">
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="card-view">
          <div v-if="filteredContacts.length === 0" class="empty-state">
            <el-empty description="暂无联系人" :image-size="100">
              <el-button type="primary" @click="showAddDialog">添加联系人</el-button>
            </el-empty>
          </div>
          <div v-else class="contacts-grid">
            <div
                v-for="contact in filteredContacts"
                :key="contact.id"
                class="contact-card"
                @click="showDetail(contact)"
            >
              <div class="card-avatar">
                <el-avatar :size="56" class="avatar">{{ contact.name[0] }}</el-avatar>
                <el-tag v-if="contact.type === 'internal'" size="small" type="primary" effect="plain" class="type-tag">内部</el-tag>
                <el-tag v-else size="small" type="success" effect="plain" class="type-tag">外部</el-tag>
              </div>
              <div class="card-info">
                <div class="info-name">{{ contact.name }}</div>
                <div class="info-company">{{ contact.company || contact.department }}</div>
                <div class="info-position">{{ contact.position }}</div>
                <div v-if="contact.tags" class="info-tags">
                  <el-tag v-for="tag in contact.tags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <el-tooltip content="发消息" placement="top">
                  <el-button link size="small" :icon="ChatDotRound" @click="handleMessage(contact)" />
                </el-tooltip>
                <el-tooltip content="发起会议" placement="top">
                  <el-button link size="small" :icon="VideoCamera" @click="handleMeeting(contact)" />
                </el-tooltip>
                <el-tooltip content="查看详情" placement="top">
                  <el-button link size="small" :icon="View" @click="showDetail(contact)" />
                </el-tooltip>
                <el-tooltip v-if="activeTab === 'external'" content="添加到常用" placement="top">
                  <el-button link size="small" :icon="Star" @click="addToFavorites(contact)" />
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-table :data="filteredContacts" border stripe>
            <el-table-column label="头像" width="60" align="center">
              <template #default="{ row }">
                <el-avatar :size="36" class="table-avatar">{{ row.name[0] }}</el-avatar>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.type === 'internal' ? 'primary' : 'success'" size="small">
                  {{ row.type === 'internal' ? '内部' : '外部' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="department" label="部门" width="120" />
            <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
            <el-table-column prop="position" label="职位" width="120" />
            <el-table-column prop="phone" label="手机号" width="130">
              <template #default="{ row }">{{ maskPhone(row.phone) }}</template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧字母导航 -->
      <div class="right-panel">
        <div class="alpha-nav">
          <div v-for="letter in alphabet" :key="letter" class="alpha-item" @click="scrollToLetter(letter)">
            {{ letter }}
          </div>
        </div>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
        v-model="drawerVisible"
        size="420px"
        :with-header="false"
        class="detail-drawer"
        :close-on-click-modal="false"
    >
      <div v-if="currentContact" class="detail-wrapper">
        <div class="detail-header-bg">
          <div class="close-btn" @click="drawerVisible = false">
            <el-icon size="20"><Close /></el-icon>
          </div>
        </div>

        <div class="profile-card">
          <div class="profile-avatar-wrap">
            <el-avatar :size="88" class="profile-avatar">{{ currentContact.name[0] }}</el-avatar>
          </div>
          <div class="profile-name">{{ currentContact.name }}</div>
          <div class="profile-position">{{ currentContact.position }}</div>
          <div class="profile-company">{{ currentContact.company || currentContact.department }}</div>
          <el-tag v-if="currentContact.type === 'internal'" type="primary" size="small" effect="plain" style="margin-top: 12px">内部联系人</el-tag>
          <el-tag v-else type="success" size="small" effect="plain" style="margin-top: 12px">外部联系人</el-tag>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="section-header">
            <el-icon class="section-icon"><Phone /></el-icon>
            <span class="section-title">联系方式</span>
          </div>
          <div class="contact-list">
            <div class="contact-item">
              <el-icon class="contact-icon"><Phone /></el-icon>
              <div class="contact-info">
                <div class="contact-label">办公电话</div>
                <div class="contact-value">{{ currentContact.officePhone || '-' }}</div>
              </div>
              <el-button link size="small" @click="copyText(currentContact.officePhone)">复制</el-button>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><Iphone /></el-icon>
              <div class="contact-info">
                <div class="contact-label">手机</div>
                <div class="contact-value">{{ maskPhone(currentContact.phone) }}</div>
              </div>
              <el-button link size="small" @click="copyText(currentContact.phone)">复制</el-button>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><Message /></el-icon>
              <div class="contact-info">
                <div class="contact-label">邮箱</div>
                <div class="contact-value">{{ currentContact.email }}</div>
              </div>
              <el-button link size="small" @click="copyText(currentContact.email)">复制</el-button>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="detail-section">
          <div class="section-header">
            <el-icon class="section-icon"><ChatDotRound /></el-icon>
            <span class="section-title">快速协作</span>
          </div>
          <div class="action-buttons">
            <el-button type="primary" :icon="ChatDotRound" class="action-btn-large" @click="handleMessage(currentContact)">
              发送消息
            </el-button>
            <el-button type="success" :icon="VideoCamera" class="action-btn-large" @click="handleMeeting(currentContact)">
              发起会议
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 添加联系人对话框 -->
    <el-dialog v-model="addDialogVisible" title="添加联系人" width="600px">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="联系人类型">
          <el-radio-group v-model="addForm.type">
            <el-radio value="internal">内部同事</el-radio>
            <el-radio value="external">外部人员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="addForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item v-if="addForm.type === 'external'" label="公司" required>
          <el-input v-model="addForm.company" placeholder="请输入公司" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="addForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="addForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search, Plus, Upload, Download, Refresh, ChatDotRound, VideoCamera,
  View, Star, Close, Phone, Iphone, Message
} from '@element-plus/icons-vue'

const activeTab = ref('favorites')
const searchKeyword = ref('')
const viewMode = ref('card')
const currentGroup = ref('all')
const drawerVisible = ref(false)
const currentContact = ref(null)
const addDialogVisible = ref(false)

const addForm = ref({
  type: 'internal',
  name: '',
  company: '',
  position: '',
  phone: '',
  email: '',
  remark: ''
})

const treeProps = { children: 'children', label: 'label' }

const favoriteGroups = ref([
  {
    key: 'all',
    label: '全部常用',
    icon: 'List',
    count: 4,
    children: [
      { key: 'internal', label: '内部常用', icon: 'User', count: 2 },
      { key: 'external', label: '外部常用', icon: 'UserFilled', count: 2 }
    ]
  }
])

const externalGroups = ref([
  {
    key: 'all',
    label: '全部外部',
    icon: 'List',
    count: 4,
    children: [
      { key: 'customer', label: '客户', icon: 'Star', count: 2 },
      { key: 'supplier', label: '供应商', icon: 'Goods', count: 1 },
      { key: 'partner', label: '合作伙伴', icon: 'Connection', count: 1 }
    ]
  }
])

const favorites = ref([
  { id: 1, name: '张三', type: 'internal', department: '研发中心', company: '', position: '前端工程师', phone: '13812345678', officePhone: '010-88886666', email: 'zhangsan@company.com' },
  { id: 2, name: '李四', type: 'internal', department: '产品部', company: '', position: '产品经理', phone: '13987654321', officePhone: '010-88886667', email: 'lisi@company.com' },
  { id: 3, name: '王五', type: 'external', department: '', company: 'XX科技', position: '销售总监', phone: '13711112222', officePhone: '', email: 'wangwu@xxtech.com', tags: ['客户'] },
  { id: 4, name: '赵六', type: 'external', department: '', company: 'YY贸易', position: '采购经理', phone: '13622223333', officePhone: '', email: 'zhaoliu@yytrade.com', tags: ['供应商'] }
])

const externals = ref([
  { id: 3, name: '王五', type: 'external', department: '', company: 'XX科技', position: '销售总监', phone: '13711112222', officePhone: '', email: 'wangwu@xxtech.com', tags: ['客户'] },
  { id: 4, name: '赵六', type: 'external', department: '', company: 'YY贸易', position: '采购经理', phone: '13622223333', officePhone: '', email: 'zhaoliu@yytrade.com', tags: ['供应商'] },
  { id: 5, name: '孙七', type: 'external', department: '', company: 'ZZ咨询', position: '顾问', phone: '13533334444', officePhone: '', email: 'sunqi@zzconsult.com', tags: ['合作伙伴'] },
  { id: 6, name: '周八', type: 'external', department: '', company: 'XX科技', position: '技术总监', phone: '13444445555', officePhone: '', email: 'zhouba@xxtech.com', tags: ['客户'] }
])

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const currentGroups = computed(() => {
  return activeTab.value === 'favorites' ? favoriteGroups.value : externalGroups.value
})

const currentContacts = computed(() => {
  return activeTab.value === 'favorites' ? favorites.value : externals.value
})

const filteredContacts = computed(() => {
  let result = currentContacts.value
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(c => c.name.toLowerCase().includes(keyword) || (c.company || '').toLowerCase().includes(keyword))
  }
  return result
})

const handleSearch = () => {}

const handleGroupClick = (data) => {
  currentGroup.value = data.key
}

const showDetail = (contact) => {
  currentContact.value = contact
  drawerVisible.value = true
}

const handleMessage = (contact) => {
  ElMessage.info(`给 ${contact.name} 发送消息`)
}

const handleMeeting = (contact) => {
  ElMessage.info(`邀请 ${contact.name} 参会`)
}

const addToFavorites = (contact) => {
  ElMessage.success(`已将 ${contact.name} 添加到常用联系人`)
}

const scrollToLetter = (letter) => {
  ElMessage.info(`跳转到 ${letter}`)
}

const copyText = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

const maskPhone = (phone) => {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

const showAddDialog = () => {
  addDialogVisible.value = true
}

const handleAdd = () => {
  ElMessage.success('添加成功')
  addDialogVisible.value = false
}

const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

const handleExport = () => {
  ElMessage.success('正在导出...')
}

const loadData = () => {
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.personal-contacts {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f0f2f5;

  .toolbar-card {
    margin: 12px 16px 0;
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 12px 16px;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .toolbar-left {
        display: flex;
        align-items: center;
      }
    }
  }

  .tabs-bar {
    margin: 12px 16px 0;
    background: #fff;
    border-radius: 8px;
    padding: 0 16px;

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 12px;
    padding: 12px 16px 16px;
    overflow: hidden;

    .left-panel {
      width: 220px;
      flex-shrink: 0;

      .group-panel {
        height: 100%;
        border-radius: 8px;
        overflow-y: auto;

        :deep(.el-card__body) {
          padding: 12px;
          height: 100%;
        }

        :deep(.el-tree) {
          background: transparent;

          .el-tree-node__content {
            height: 32px;
            border-radius: 4px;
            margin-bottom: 2px;

            &:hover {
              background-color: #f5f7fa;
            }
          }

          .is-current > .el-tree-node__content {
            background-color: #ecf5ff;
            color: #409eff;
          }
        }

        .group-node {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;

          .group-icon {
            color: #409eff;
            font-size: 14px;
          }

          .group-label {
            flex: 1;
            font-size: 13px;
          }

          .group-count {
            font-size: 11px;
          }
        }
      }
    }

    .center-panel {
      flex: 1;
      overflow-y: auto;
      background: #fff;
      border-radius: 8px;
      padding: 16px;

      .card-view {
        .contacts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;

          .contact-card {
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 8px;
            padding: 20px 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              border-color: #409eff;
              transform: translateY(-2px);
            }

            .card-avatar {
              position: relative;
              display: inline-block;
              margin-bottom: 12px;

              .avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                font-size: 20px;
                font-weight: 500;
              }

              .type-tag {
                position: absolute;
                top: -4px;
                right: -4px;
              }
            }

            .card-info {
              margin-bottom: 12px;

              .info-name {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 4px;
              }

              .info-company {
                font-size: 13px;
                color: #606266;
                margin-bottom: 4px;
              }

              .info-position {
                font-size: 12px;
                color: #909399;
                margin-bottom: 6px;
              }

              .info-tags {
                display: flex;
                justify-content: center;
                gap: 4px;
                flex-wrap: wrap;
              }
            }

            .card-actions {
              display: flex;
              justify-content: center;
              gap: 12px;
              padding-top: 12px;
              border-top: 1px solid #f0f0f0;

              .el-button {
                font-size: 18px;
                padding: 4px;
              }
            }
          }
        }
      }

      .list-view {
        .table-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 14px;
        }
      }
    }

    .right-panel {
      width: 32px;
      flex-shrink: 0;

      .alpha-nav {
        background: #fff;
        border-radius: 16px;
        padding: 8px 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .alpha-item {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          color: #409eff;
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            background: #ecf5ff;
            font-weight: 600;
          }
        }
      }
    }
  }

  .empty-state {
    padding: 80px 0;
  }

  :deep(.detail-drawer) {
    .el-drawer__body {
      padding: 0;
    }
  }

  .detail-wrapper {
    padding: 20px 24px;

    .detail-header-bg {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;

      .close-btn {
        cursor: pointer;
        color: #909399;
        transition: color 0.2s;

        &:hover {
          color: #303133;
        }
      }
    }

    .profile-card {
      text-align: center;
      margin-bottom: 24px;

      .profile-avatar-wrap {
        display: inline-block;
        margin-bottom: 16px;

        .profile-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 32px;
          font-weight: 500;
        }
      }

      .profile-name {
        font-size: 20px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 6px;
      }

      .profile-position {
        font-size: 14px;
        color: #409eff;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .profile-company {
        font-size: 13px;
        color: #606266;
      }
    }

    .detail-section {
      .section-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        .section-icon {
          font-size: 18px;
          color: #409eff;
        }

        .section-title {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }

      .contact-list {
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f5f7fa;
          border-radius: 6px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .contact-icon {
            font-size: 18px;
            color: #409eff;
          }

          .contact-info {
            flex: 1;

            .contact-label {
              font-size: 11px;
              color: #909399;
              margin-bottom: 2px;
            }

            .contact-value {
              font-size: 13px;
              color: #303133;
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .action-btn-large {
          width: 100%;
        }
      }
    }
  }
}
</style>
