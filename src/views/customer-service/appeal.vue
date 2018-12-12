<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.appealTime" @change="appealSortChange" placeholder="申诉时间排序">
        <el-option v-for="item in appealTimeSortList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 170px" class="filter-item" v-model="query.updateTime" @change="updateSortChange" placeholder="申诉更新时间排序">
        <el-option v-for="item in updateTimeSortList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.status" @change="handleFilter" placeholder="请选择申诉状态">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.orderStatus" @change="handleFilter" placeholder="请选择订单状态">
        <el-option v-for="item in orderStatusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="min-height:500px;">
      <el-table-column align="center" label="申诉日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.appeal_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="申诉更新日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.update_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="申诉状态" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.appealStatus | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="申诉编号" width="100" prop="id"></el-table-column>
      <!--<el-table-column align="center" label="申诉原因" width="180">-->
        <!--<template slot-scope="scope">-->
          <!--<span>{{scope.row.appeal_reason | reasonFilter}}</span>-->
        <!--</template>-->
      <!--</el-table-column>-->
      <el-table-column align="center" label="订单状态" width="100">
        <template slot-scope="scope">
          <span>{{scope.row.order_status | orderStatusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单冻结币种" width="150" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="订单冻结金额" width="150" prop="frozen_balance">
        <template slot-scope="scope">
          <span>{{scope.row.quantity | calculateTotal(scope.row.price)}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作人" width="150" prop="name"></el-table-column>
      <el-table-column align="center" label="操作日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.operate_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button round @click="showDetail(scope.row)">明细</el-button>
          <el-button v-if="scope.row.order_status === 5" type="primary" size="mini" @click="handleCancelOrder(scope.row)" style="width: 66px">取消订单</el-button>
          <el-button v-if="scope.row.order_status === 5" size="mini" type="success" @click="handleTransferMoney(scope.row)" style="width: 66px">划转资金</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="查看" :visible.sync="dialogFormVisible">
      <h2>申诉编号：SS001</h2>
      <el-row>
        <el-col :span="12">
          <div class="dialog-item">广告类型：{{tempInfo.advert_type}}</div>
          <div class="dialog-item">订单编号：{{tempInfo.order_no}}</div>
          <div class="dialog-item">订单数量：{{tempInfo.quantity}}</div>
          <div class="dialog-item">商户邮箱：{{tempInfo.email}}</div>
          <div class="dialog-item">手机号：{{tempInfo.mobile_number}}</div>
          <div class="dialog-item">交易对手方UID：{{tempInfo.counterparty_id}}</div>
          <div class="dialog-item">手机号：{{tempInfo.counterpartyAccount[0].mobile_number}}</div>
        </el-col>
        <el-col :span="12">
          <div class="dialog-item">广告编号：{{tempInfo.advert_no}}</div>
          <div class="dialog-item">订单币种：{{tempInfo.coin_code}}</div>
          <div class="dialog-item">订单金额：{{tempInfo.quantity | calculateTotal(tempInfo.price)}}</div>
          <div class="dialog-item">商户账号：{{tempInfo.email}}</div>
          <div class="dialog-item">邮箱：{{tempInfo.email}}</div>
          <div class="dialog-item">交易对手方账号：{{tempInfo.counterpartyAccount[0].mobile_number}}</div>
          <div class="dialog-item">邮箱：{{tempInfo.counterpartyAccount[0].email}}</div>
        </el-col>
      </el-row>
      <h2>申述处理记录</h2>
      <div class="record-item" v-for="item in tempInfo.detailList">
        <div class="record-title">* {{item.detail_create_time | parseTime}} <span class="record-label">{{item.new_status | newStatusFilter}}</span></div>
        <div class="record-content">内容： {{item.content}}</div>
        <div class="record-img">
          <PictureView v-if="item.appealDetailList" :pictureList="getPictureList(item.appealDetailList)" width="50" height="50" :key="new Date().getTime()"></PictureView>
        </div>
      </div>
      <div v-if="tempInfo.order_status != 1" class="opinion-wrap">
        <h2>追加处理意见</h2>
        <el-input type="textarea" :rows="3" v-model="tempInfo.addedOpinion" placeholder="请输入内容"></el-input>
        <el-upload
          class="upload-demo"
          :action="uploadAction"
          :on-remove="handleRemove"
          :on-success="handleSuccess"
          :file-list="tempInfo.uploadImgList"
          list-type="picture">
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip" style="display: inline-block;margin-left: 16px;">只能上传图片文件，且不超过5M</div>
        </el-upload>
      </div>
      <div slot="footer" class="dialog-footer" style="text-align: center;">
        <el-button v-if="tempInfo.order_status != 1" type="primary" @click="addOpinion">追加处理意见</el-button>
        <el-button v-else @click="dialogFormVisible=false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { appealFetchAll, appealFetchDetail, appealAddOpinion, appealCancelOrder, appealTansferMoney } from '@/api/customerService'
  import waves from '@/directive/waves' // 水波纹指令
  import PictureView from 'vue-simple-picture-preview'

  export default {
    name: 'appealProcess',
    components: {
      PictureView
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          1: '买方处理',
          2: '卖方处理',
          3: '客服处理',
          4: '申诉完成'
        }
        return statusMap[status]
      },
      orderStatusFilter(status) {
        const statusMap = {
          1: '已完成',
          2: '已取消',
          3: '未付款',
          4: '已付款',
          5: '申诉中'
        }
        return statusMap[status]
      },
      calculateTotal(count, price) {
        if (isNaN(count) || isNaN(price)) {
          return ''
        } else {
          return count * price
        }
      },
      newStatusFilter(status) {
        const map = {
          1: '买方处理',
          2: '卖方处理',
          3: '客服处理',
          4: '申诉完成'
        }
        return map[status]
      },
      reasonFilter(status) {
        const map = {
          '00': '买方未按时付款',
          '01': '买方付款金额与订单金额不匹配',
          '02': '付款账号实名与平台认证不一致',
          '03': '买方输入付款码错误',
          '04': '卖方未按时放币',
          '05': '卖方收款方式有误',
          '06': '买方付款备注包含敏感词语',
          '07': '其它'
        }
        return map[status]
      }
    },
    directives: {
      waves
    },
    data() {
      return {
        uploadAction: 'http://192.168.60.199:8080/DaVaoBusiness/file/uploadImg?type=9',
        tempInfo: {
          icons: ['http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg', 'http://img.sccnn.com/bimg/338/24556.jpg'],
          full_name: 'sssssssssssss',
          uploadImgList: [],
          addedOpinion: '',
          addedFileList: [],
          counterpartyAccount: [{}],
          appealDetailList: []
        },
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15,
          status: '',
          orderStatus: '',
          appealTime: 'true',
          updateTime: ''
        },
        dialogFormVisible: false,
        statusList: [{
          id: 1,
          label: '买方处理'
        }, {
          id: 2,
          label: '卖方处理'
        }, {
          id: 3,
          label: '客服处理'
        }, {
          id: 4,
          label: '申诉完成'
        }],
        orderStatusList: [{
          id: 1,
          label: '已完成'
        }, {
          id: 2,
          label: '已取消'
        }, {
          id: 3,
          label: '未付款'
        }, {
          id: 4,
          label: '已付款'
        }, {
          id: 5,
          label: '申诉中'
        }],
        appealTimeSortList: [{
          id: 'false',
          label: '申诉日期正序'
        }, {
          id: 'true',
          label: '申诉日期倒序'
        }],
        updateTimeSortList: [{
          id: 'false',
          label: '申诉更新日期正序'
        }, {
          id: 'true',
          label: '申诉更新日期倒序'
        }]
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getPictureList(list) {
        const result = []
        list.forEach(item => {
          result.push(item.picture_address)
        })
        return result
      },
      handleCancelOrder(row) {
        this.$confirm('确定取消订单?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          appealCancelOrder(row.order_id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      handleTransferMoney(row) {
        this.$confirm('确定划转资金?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          appealTansferMoney(row.order_id).then(res => {
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
        appealFetchDetail({ id: row.id }).then(result => {
          if (result.data.length > 0) {
            this.tempInfo = Object.assign({}, result.data[0])
          } else {
            this.tempInfo = {
              counterpartyAccount: [{}]
            }
          }
          this.tempInfo.detailList = result.data
          this.tempInfo.addedFileList = []
          this.tempInfo.uploadImgList = []
          loading.close()
          this.dialogFormVisible = true
        }).catch(e => {
          loading.close()
        })
      },
      getList() {
        this.listLoading = true
        appealFetchAll(this.query).then(result => {
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
      addOpinion() {
        if (!this.tempInfo.addedOpinion) {
          this.$message.error('请填写内容')
        } else {
          let picList = []
          this.tempInfo.addedFileList.forEach(file => {
            picList.push(file.response.data.fileUrl)
          })
          picList = '[' + picList.join(',') + ']'
          const para = {
            id: this.tempInfo.appealId,
            content: this.tempInfo.addedOpinion,
            pictureAddresses: picList,
            email: this.tempInfo.email,
            mobileNumber: this.tempInfo.mobile_number,
            analogueEmail: this.tempInfo.counterpartyAccount[0].email,
            analogueMobileNumber: this.tempInfo.counterpartyAccount[0].mobile_number
          }
          appealAddOpinion(para).then(result => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.showDetail({ id: this.tempInfo.appealId })
          })
        }
      },
      appealSortChange() {
        console.log(this.query.appealTime)
        if (this.query.appealTime !== '') {
          this.query.updateTime = ''
        }
        this.getList()
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      updateSortChange() {
        console.log(this.query.updateTime)
        if (this.query.updateTime !== '') {
          this.query.appealTime = ''
        }
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
