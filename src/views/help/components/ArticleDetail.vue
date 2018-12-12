<template>
  <div class="createPost-container">
    <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">

      <sticky :className="'sub-navbar draft'">
        <div style="text-align: left;color: #666;">
          <span style="margin-right: 100px;margin-left: 46px;">操作：{{isEdit ? '编辑' : '新增'}}</span>
          分类： {{categoryName}}
        </div>
        <el-button v-loading="loading" style="margin-left: 10px;position: absolute;top: 7px;right: 51px;" type="success"
                   @click="submitForm">发布
        </el-button>
      </sticky>

      <div class="createPost-main-container">
        <div style="padding-bottom: 15px;">
          <el-form-item style="margin-bottom: 20px;" prop="title">
            <MDinput name="name" v-model="postForm.title" required :maxlength="100">
              标题
            </MDinput>
          </el-form-item>

          <div class="postInfo-container" style="margin-top: 35px;">
            <el-row>
              <el-col :span="8">
                <el-form-item label-width="60px" label="作者:" class="postInfo-container-item" prop="author">
                  <el-input placeholder="请输入" v-model="postForm.author"></el-input>
                </el-form-item>
              </el-col>

              <el-col :span="10">
                <el-form-item label-width="120px" label="发布时间:" class="postInfo-container-item" prop="incidentTime">
                  <el-date-picker v-model="postForm.incidentTime" type="datetime" format="yyyy-MM-dd HH:mm:ss"
                                  placeholder="选择日期时间">
                  </el-date-picker>
                </el-form-item>
              </el-col>

            </el-row>
          </div>

          <el-row>
            <el-col :span="12">
              <el-form-item label="图片：" label-width="60px" style="width: 600px;position: relative">
                <el-upload
                  class="avatar-uploader"
                  :action="uploadAction"
                  name="file"
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload">
                  <img v-if="imageUrl" :src="imageUrl" class="avatar">
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
                <span style="color: red;position: absolute;top: 40px;left: 191px;">(图片尺寸为207*137pix)</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item style="margin-bottom: 40px;" label-width="60px" label="摘要:" prop="subhead">
            <el-input type="textarea" class="article-textarea" :rows="1" autosize placeholder="请输入内容"
                      v-model="postForm.subhead">
            </el-input>
            <span class="word-counter" v-show="contentShortLength">{{contentShortLength}}字</span>
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
  import { helpDetailFetch, helpDetailCreate, helpDetailUpdate } from '@/api/help'
  import { isEmpty } from '@/utils'

  const defaultForm = {
    title: '', // 文章题目
    content: '', // 文章内容
    id: undefined,
    subhead: '',
    incidentTime: new Date(),
    author: ''
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
        categoryName: '',
        rules: {
          title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
          subhead: [{ required: true, message: '请输入', trigger: 'blur' }],
          author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
          incidentTime: [{ required: true, message: '请选择', trigger: 'blur' }]
        },
        uploadAction: '',
        imageUrl: '',
        dateValue: new Date()
      }
    },
    computed: {
      contentShortLength() {
        if (this.postForm.subhead) {
          return this.postForm.subhead.length
        } else {
          return 0
        }
      }
    },
    created() {
      this.uploadAction = this.baseUrl + '/file/uploadImg'
      this.categoryName = this.$route.query.categoryName
      this.isEdit = !!this.$route.query.titleId
      this.postForm = Object.assign({}, defaultForm)
      this.imageUrl = ''
      if (this.isEdit) {
        const id = this.$route.query.titleId
        this.fetchData(id)
      } else {
        this.postForm.catalogId = this.$route.query.categoryId
      }
    },
    methods: {
      fetchData(id) {
        helpDetailFetch(id).then(response => {
          const data = response.data[0]
          data.incidentTime = new Date(data.incident_time)
          this.postForm = data
          this.imageUrl = this.postForm.picture_url
        }).catch(err => {
          console.log(err)
        })
      },
      submitForm() {
        this.$refs.postForm.validate(valid => {
          if (valid) {
            if (!this.imageUrl) {
              this.$message.error('请上传图片')
              return
            }
            if (isEmpty(this.postForm.content)) {
              this.$message.error('请输入内容')
              return
            }
            this.loading = true
            const action = this.isEdit ? helpDetailUpdate : helpDetailCreate
            const para = {
              ...this.postForm,
              pictureUrl: this.imageUrl
            }
            action(para).then(res => {
              console.log(111, res)
              this.$notify({
                title: '成功',
                message: '发布成功',
                type: 'success',
                duration: 2000
              })
              this.loading = false
              const view = {
                path: '/category/module-detail'
              }
              this.$store.dispatch('delVisitedViews', view).then((views) => {
                this.$router.push({
                  path: 'module-list',
                  query: {
                    categoryId: this.$route.query.categoryId,
                    categoryName: this.$route.query.categoryName
                  }
                })
              })
            })
          }
        })
      },
      handleAvatarSuccess(res) {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '上传成功!'
          })
          this.imageUrl = res.data.fileUrl
        } else {
          this.$message.error(res.info)
        }
      },
      beforeAvatarUpload(file) {
        // const isJPG = file.type === 'image/jpeg'
        const isLt5M = file.size / 1024 / 1024 < 5
        const isImg = file.type.indexOf('image') > -1

        if (!isImg) {
          this.$message.error('请上传图片!')
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过 5MB!')
          false
        }
        return true
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
