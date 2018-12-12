<template>
  <div class="upload-container">
    <!--<el-button icon='el-icon-upload' size="mini" :style="{background:color,borderColor:color}" @click=" dialogVisible=true" type="primary">上传视频-->
    <!--</el-button>-->

    <el-upload :action="url" :multiple="false" :show-file-list="false" :on-success="handleSuccess" :before-upload="beforeUpload" style="height: 30px;">
      <el-button icon='el-icon-upload' size="mini" :style="{background:color,borderColor:color}" type="primary">上传视频</el-button>
    </el-upload>
  </div>
</template>

<script>
// import { getToken } from 'api/qiniu'
import { Loading } from 'element-ui'

let loadingInstance = null

export default {
  name: 'editorSlideUpload',
  props: {
    color: {
      type: String,
      default: '#1890ff'
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      listObj: {},
      fileList: [],
      uploadAction: ''
    }
  },
  methods: {
    handleSubmit() {
      const arr = Object.keys(this.listObj).map(v => this.listObj[v])
      if (!this.checkAllSuccess()) {
        this.$message('请等待所有文件上传成功 或 出现了网络问题，请刷新页面重新上传！')
        return
      }
      console.log(arr)
      this.$emit('successCBK', arr)
      this.listObj = {}
      this.fileList = []
      this.dialogVisible = false
    },
    handleSuccess(response, file) {
      if (response.code === '0') {
        this.$emit('successCBK', response.data.fileUrl)
      } else {
        this.$message.error(response.message)
      }
      loadingInstance.close()
    },
    beforeUpload(file) {
      if (file.type.indexOf('video') === -1) {
        this.$message.error('请上传视频')
        return false
      }
      loadingInstance = Loading.service({})
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.editor-slide-upload {
  margin-bottom: 20px;
  /deep/ .el-upload--picture-card {
    width: 100%;
  }
}
</style>
