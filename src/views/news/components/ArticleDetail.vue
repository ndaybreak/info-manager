<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky :className="'sub-navbar draft'">
        <div style="text-align: left;color: #666;">
          <span style="margin-right: 100px;margin-left: 46px;">操作：{{isEdit ? '编辑' : '新增'}}</span></div>
        <el-button v-loading="loading" style="margin-left: 10px;position: absolute;top: 7px;right: 51px;" type="success" @click="submitForm">发布
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <div style="padding-bottom: 15px;">
          <el-form-item style="margin-bottom: 40px;" prop="title">
            <MDinput name="name" v-model="postForm.title" required :maxlength="100">
              标题
            </MDinput>
          </el-form-item>
          <el-form-item label="发布时间:" class="postInfo-container-item" prop="incidentTime">
            <el-date-picker v-model="postForm.incidentTime" type="datetime" format="yyyy-MM-dd HH:mm:ss"
                            placeholder="选择日期时间">
            </el-date-picker>
          </el-form-item>
        </div>

        <div class="editor-container">
          <Tinymce :height=400 ref="editor" v-model="postForm.content" :uploadUrl="uploadAction"/>
        </div>
      </div>
    </el-form>

  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'
import MDinput from '@/components/MDinput'
import Sticky from '@/components/Sticky' // 粘性header组件
import { newsDetailFetch, newsDetailCreate, newsDetailUpdate } from '@/api/news'
import { isEmpty } from '@/utils'

const defaultForm = {
  title: '', // 文章题目
  content: '', // 文章内容
  incidentTime: new Date(),
  id: undefined
}

export default {
  name: 'articleDetail',
  components: { Tinymce, MDinput, Sticky },
  data() {
    return {
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      isEdit: false,
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        incidentTime: [{ required: true, message: '请选择', trigger: 'blur' }]
      },
      languageList: [{
        id: 0,
        label: '中文'
      }, {
        id: 1,
        label: '英文'
      }],
      uploadAction: ''
    }
  },
  created() {
    this.uploadAction = this.baseUrl + '/file/uploadImg'
    this.isEdit = !!this.$route.query.titleId
    if (this.isEdit) {
      const id = this.$route.query.titleId
      this.fetchData(id)
    } else {
      this.postForm = Object.assign({}, defaultForm)
      this.postForm.catalogId = this.$route.query.categoryId
    }
  },
  methods: {
    fetchData(id) {
      newsDetailFetch(id).then(response => {
        const data = response.data[0]
        data.incidentTime = new Date(data.incident_time)
        this.postForm = data
        this.postForm.id = id
      }).catch(err => {
        console.log(err)
      })
    },
    submitForm() {
      this.$refs.postForm.validate(valid => {
        if (valid) {
          if (isEmpty(this.postForm.content)) {
            this.$message.error('请输入内容')
            return
          }
          this.loading = true
          const action = this.isEdit ? newsDetailUpdate : newsDetailCreate
          action(this.postForm).then(res => {
            console.log(111, res)
            this.$notify({
              title: '成功',
              message: '发布成功',
              type: 'success',
              duration: 2000
            })
            this.loading = false
            const view = {
              path: '/news/news-detail'
            }
            this.$store.dispatch('delVisitedViews', view).then((views) => {
              this.$router.push({
                path: 'news-list',
                query: {
                  categoryId: this.$route.query.categoryId
                }
              })
            })
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.createPost-container {
  position: relative;
  .createPost-main-container {
    padding: 20px 45px 20px 50px;
    .postInfo-container {
      position: relative;
      margin-bottom: 10px;
      .postInfo-container-item {
        float: left;
      }
    }
    .editor-container {
      min-height: 500px;
      margin: 0 0 30px;
      .editor-upload-btn-container {
        text-align: right;
        margin-right: 10px;
        .editor-upload-btn {
          display: inline-block;
        }
      }
    }
  }
  .word-counter {
    width: 40px;
    position: absolute;
    right: -10px;
    top: 0px;
  }
}
</style>
