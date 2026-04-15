<template>
  <div class="card-preview">
    <div class="preview-card">
      <div class="preview-avatar">
        <el-avatar :size="60" :src="userData.avatar || defaultAvatar" />
      </div>

      <div class="preview-info">
        <div class="preview-name">{{ userData.name }}</div>
        <div class="preview-position">{{ userData.position }}</div>
        <div class="preview-department">{{ userData.department }}</div>

        <div class="preview-contacts">
          <div class="contact-line" v-if="shouldShowMobile">
            <span class="label">手机：</span>
            <span class="value">{{ formatMobile(userData.mobile) }}</span>
          </div>
          <div class="contact-line">
            <span class="label">邮箱：</span>
            <span class="value">{{ userData.email }}</span>
          </div>
          <div class="contact-line">
            <span class="label">座机：</span>
            <span class="value">{{ userData.officePhone }}</span>
          </div>
          <div class="contact-line" v-if="shouldShowWorkstation">
            <span class="label">工位：</span>
            <span class="value">{{ userData.workstation }}</span>
          </div>
        </div>

        <div class="preview-signature" v-if="shouldShowSignature && userData.signature">
          {{ userData.signature }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  privacySettings: {
    type: Object,
    required: true
  }
})

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjOTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIg8L3RleHQ+PC9zdmc+'

const shouldShowMobile = computed(() => {
  return props.privacySettings.showMobile
})

const shouldShowWorkstation = computed(() => {
  return props.privacySettings.showWorkstation
})

const shouldShowSignature = computed(() => {
  return props.privacySettings.showSignature
})

const formatMobile = (mobile) => {
  if (!props.privacySettings.showMobile) {
    return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return mobile
}
</script>

<style scoped lang="scss">
.card-preview {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  .preview-card {
    display: flex;
    gap: 16px;

    .preview-avatar {
      flex-shrink: 0;
    }

    .preview-info {
      flex: 1;

      .preview-name {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .preview-position {
        font-size: 13px;
        color: #606266;
        margin-bottom: 2px;
      }

      .preview-department {
        font-size: 13px;
        color: #909399;
        margin-bottom: 12px;
      }

      .preview-contacts {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 12px;

        .contact-line {
          display: flex;
          font-size: 12px;

          .label {
            color: #909399;
            min-width: 50px;
          }

          .value {
            color: #606266;
          }
        }
      }

      .preview-signature {
        font-size: 12px;
        color: #909399;
        font-style: italic;
        padding-top: 8px;
        border-top: 1px dashed #e4e7ed;
      }
    }
  }
}
</style>
