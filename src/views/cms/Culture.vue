<template>
  <div class="culture-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="banner-card">
          <template #header>
            <span>企业文化</span>
          </template>
          <div class="banner-content">
            <el-carousel height="300px">
              <el-carousel-item v-for="item in banners" :key="item.id">
                <div class="carousel-item" :style="{ background: item.color }">
                  <h2>{{ item.title }}</h2>
                  <p>{{ item.description }}</p>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card class="value-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="24" color="#409eff"><Star /></el-icon>
              <span>企业愿景</span>
            </div>
          </template>
          <div class="value-content">
            <p>{{ vision }}</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="value-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="24" color="#67c23a"><Flag /></el-icon>
              <span>企业使命</span>
            </div>
          </template>
          <div class="value-content">
            <p>{{ mission }}</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="value-card">
          <template #header>
            <div class="card-title">
              <el-icon :size="24" color="#e6a23c"><Medal /></el-icon>
              <span>核心价值观</span>
            </div>
          </template>
          <div class="value-content">
            <p>{{ values }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="gallery-card">
          <template #header>
            <div class="card-header">
              <span>员工风采</span>
              <el-button link type="primary" @click="handleAddPhoto">
                <el-icon><Plus /></el-icon>
                上传照片
              </el-button>
            </div>
          </template>
          <div class="photo-gallery">
            <el-image
                v-for="photo in photos"
                :key="photo.id"
                :src="photo.url"
                :preview-src-list="[photo.url]"
                fit="cover"
                class="photo-item"
            />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="news-card">
          <template #header>
            <div class="card-header">
              <span>文化动态</span>
              <el-button link type="primary" @click="handleAddNews">
                <el-icon><Plus /></el-icon>
                发布动态
              </el-button>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
                v-for="activity in activities"
                :key="activity.id"
                :timestamp="activity.time"
                placement="top"
            >
              <el-card>
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.content }}</p>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Star, Flag, Medal, Plus } from '@element-plus/icons-vue'

const banners = ref([
  { id: 1, title: '团结奋进', description: '凝心聚力，共创辉煌', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, title: '创新发展', description: '创新驱动，引领未来', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, title: '追求卓越', description: '精益求精，止于至善', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }
])

const vision = ref('成为行业内最具竞争力和影响力的企业，为客户创造价值，为员工提供发展平台，为社会做出贡献。')
const mission = ref('以客户为中心，以创新为动力，不断提升产品和服务质量，推动行业进步，实现员工与企业的共同发展。')
const values = ref('诚信、创新、责任、共赢')

const photos = ref([
  { id: 1, url: 'https://via.placeholder.com/300x200?text=Team+1' },
  { id: 2, url: 'https://via.placeholder.com/300x200?text=Team+2' },
  { id: 3, url: 'https://via.placeholder.com/300x200?text=Team+3' },
  { id: 4, url: 'https://via.placeholder.com/300x200?text=Team+4' }
])

const activities = ref([
  { id: 1, title: '2026 年年会圆满举办', content: '公司 2026 年年会在总部大楼隆重举行，全体员工参加了此次活动。', time: '2026-01-15' },
  { id: 2, title: '员工技能培训', content: '为提高员工专业技能，公司组织了为期一周的技能培训活动。', time: '2026-01-10' },
  { id: 3, title: '团队建设活动', content: '技术部组织了户外拓展活动，增强了团队凝聚力。', time: '2026-01-05' }
])

const handleAddPhoto = () => {
  ElMessage.info('上传照片功能开发中')
}

const handleAddNews = () => {
  ElMessage.info('发布动态功能开发中')
}
</script>

<style lang="scss" scoped>
.culture-page {
  padding: 20px;

  .banner-card {
    .banner-content {
      .carousel-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #fff;
        text-align: center;

        h2 {
          font-size: 36px;
          margin-bottom: 20px;
        }

        p {
          font-size: 18px;
          opacity: 0.9;
        }
      }
    }
  }

  .value-card {
    .card-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 600;
    }

    .value-content {
      padding: 20px 0;

      p {
        line-height: 1.8;
        color: #606266;
        text-align: justify;
      }
    }
  }

  .gallery-card,
  .news-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .photo-gallery {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .photo-item {
      width: 100%;
      height: 150px;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
}
</style>
