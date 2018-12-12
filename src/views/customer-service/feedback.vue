<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.accountId"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.email"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.disposeStatus" @change="handleFilter" placeholder="请选择处理状态">
        <el-option v-for="item in disposeStatusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.feedbackTime" @change="handleFilter" placeholder="反馈日期排序">
        <el-option v-for="item in feedbackTimeSortList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.type" @change="handleFilter" placeholder="请选择问题类型">
        <el-option v-for="item in typeList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="min-height:500px;">
      <!--<el-table-column align="center" label="UID" width="120" prop="account_id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="120" prop="account_email"></el-table-column>
      <el-table-column align="center" label="区号" width="120" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="120" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="处理状态" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.dispose_status | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="反馈日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.feedback_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="问题类型" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.type | typeFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="查看明细" width="150">
        <template slot-scope="scope">
          <el-button round @click="showDetail(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="备注" width="150" prop="handler_explain"></el-table-column>
      <el-table-column align="center" label="操作人" width="150" prop="name"></el-table-column>
      <el-table-column align="center" label="操作日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.handler_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="170" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.dispose_status === 0" type="primary" size="mini" @click="hanleReplyEmail(scope.row)" style="width: 66px">回复邮件</el-button>
          <el-button v-if="scope.row.dispose_status === 0" size="mini" type="success" @click="hanleDone(scope.row)" style="width: 66px">完成</el-button>
          <span v-if="scope.row.dispose_status === 2">已完成</span>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <el-row>问题类型：{{tempInfo.type | typeFilter}}</el-row>
      <el-row>
        <el-col :span="6">
          UID： {{tempInfo.id}}
        </el-col>
        <el-col :span="18">
          客户账号：{{tempInfo.accountId}}
        </el-col>
      </el-row>
      <el-row class="feedback-info">
        <div>问题描述：</div>
        <div>     {{tempInfo.feedbackInfo}}</div>
      </el-row>
      <el-row>邮箱号：{{tempInfo.email}}</el-row>
      <div>截图：</div>
      <PictureView v-if="tempInfo.icons" :pictureList="tempInfo.icons" width="50" height="50"></PictureView>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button @click="dialogFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="回复邮件" :visible.sync="postFormVisible">
      <el-form class="form-container" :model="postForm" :rules="rules" ref="postForm">
        <el-form-item style="margin-bottom: 40px;" prop="title">
          <MDinput name="name" v-model="postForm.title" required :maxlength="100">
            标题
          </MDinput>
        </el-form-item>
        <div class="editor-container">
          <h3>邮件内容：</h3>
          <Tinymce :height=300 ref="editor" v-model="postForm.content" :uploadUrl="uploadAction"/>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="postFormVisible=false">关闭</el-button>
        <el-button @click="replyEmail" type="primary">发送</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import Tinymce from '@/components/Tinymce'
  import MDinput from '@/components/MDinput'
  import { feedbackFetchAll, feedbackFetchDetail, feedbackReplyEmail, feedbackDone } from '@/api/customerService'
  import waves from '@/directive/waves' // 水波纹指令
  // import { str2Bool, kebabCaseData2Camel } from '@/utils'
  import PictureView from 'vue-simple-picture-preview'

  export default {
    name: 'appealProcess',
    components: {
      PictureView,
      Tinymce,
      MDinput
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          0: '未处理',
          2: '完成'
        }
        return statusMap[status]
      },
      typeFilter(type) {
        const typeMap = {
          1: '卡顿',
          2: '登录相关'
        }
        return typeMap[type] || '未知'
      }
    },
    directives: {
      waves
    },
    data() {
      return {
        uploadAction: '',
        tempInfo: {
          icons: ['http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg', 'http://img.sccnn.com/bimg/338/24556.jpg']
        },
        postForm: {},
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        rules: {
          title: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        dialogFormVisible: false,
        postFormVisible: false,
        disposeStatusList: [{
          id: 0,
          label: '处理中'
        }, {
          id: 1,
          label: '处理已完成'
        }, {
          id: 2,
          label: '处理未通过'
        }],
        typeList: [{
          id: 1,
          label: '卡顿'
        }, {
          id: 2,
          label: '登录相关'
        }],
        feedbackTimeSortList: [{
          id: false,
          label: '反馈日期正序'
        }, {
          id: true,
          label: '反馈日期倒序'
        }]
      }
    },
    created() {
      this.uploadAction = this.baseUrl + '/file/uploadImg?type=6'
      this.getList()
    },
    methods: {
      hanleReplyEmail(row) {
        this.postForm = {
          id: row.id
        }
        this.postFormVisible = true
        this.$nextTick(() => {
          this.$refs['postForm'].clearValidate()
        })
      },
      replyEmail() {
        this.$refs['postForm'].validate((valid) => {
          if (valid) {
            if (!this.postForm.content) {
              this.$message.error('请填写邮件内容')
              return
            }
            feedbackReplyEmail(this.postForm).then((data) => {
              this.postFormVisible = false
              this.$notify({
                title: '成功',
                message: '发送成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      hanleDone(row) {
        this.$confirm('确认完成?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          feedbackDone({ id: row.id }).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      showDetail(row) {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        feedbackFetchDetail({ id: row.id }).then(result => {
          loading.close()
          console.log(result)
          this.tempInfo = result.data
          this.tempInfo.icons = []
          this.tempInfo.pictureOne && this.tempInfo.icons.push(this.tempInfo.pictureOne)
          this.tempInfo.pictureTwo && this.tempInfo.icons.push(this.tempInfo.pictureTwo)
          this.tempInfo.pictureThree && this.tempInfo.icons.push(this.tempInfo.pictureThree)
          this.tempInfo.icons = ['http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg', 'http://img.sccnn.com/bimg/338/24556.jpg']
          this.dialogFormVisible = true
        })
      },
      getList() {
        this.listLoading = true
        feedbackFetchAll(this.query).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
          if (this.list.length === 0 && this.query.currPage !== 1) {
            this.getList()
          }
        })
      },
      handleSizeChange(val) {
        this.query.pageSize = val
        this.getList()
      },
      handleCurrentChange(val) {
        this.query.currPage = val
        this.getList()
      },
      handleRemove(file, fileList) {
        console.log(file, fileList)
        this.tempInfo.addedFileList = fileList
      },
      handleSuccess(response, file, fileList) {
        this.tempInfo.addedFileList = fileList
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      }
    }
  }
</script>
<style scoped>
  .dialog-item {
    padding: 10px 0;
  }
  .record-label {
    font-size: 15px;
    margin-left: 15px;
    font-weight: bold;
  }
  .record-item {
    margin-bottom: 15px;
  }
</style>
