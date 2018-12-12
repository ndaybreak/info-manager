<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.id" @change="handleFilter" placeholder="请选择币种">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <el-table-column align="center" label="ID" width="50" prop="id"></el-table-column>
      <el-table-column align="center" label="简称" width="80" prop="coin_code"></el-table-column>
      <el-table-column align="center" label="英文名称" width="100" prop="coin_name"></el-table-column>
      <el-table-column align="center" label="中文名称" width="100" prop="coin_name_ch"></el-table-column>
      <el-table-column align="center" label="是否是计价币种" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.is_main_coin | bool2Ch}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否OTC交易" width="120" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.is_trade | bool2Ch}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="能否充值" width="90">
        <template slot-scope="scope">
          <span>{{scope.row.is_recharge | bool2Ch}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="能否取现" width="90">
        <template slot-scope="scope">
          <span>{{scope.row.is_withdraw_cash | bool2Ch}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="充值精度(预留)" width="120" prop="recharge_precision"></el-table-column>
      <el-table-column align="center" label="取现精度" width="90" prop="withdraw_precision"></el-table-column>
      <el-table-column align="center" label="OTC交易精度" width="100" prop="otc_precision"></el-table-column>
      <el-table-column align="center" label="保证金精度" width="100" prop="deposit_precision"></el-table-column>
      <el-table-column align="center" label="BTC兑换汇率" width="110" prop="btc_exchange_rate"></el-table-column>
      <el-table-column align="center" label="图标" width="90">
        <template slot-scope="scope">
          <img v-if="scope.row.icon" @click="showicon(scope.row)" :src="scope.row.icon" style="height: 20px;"/>
          <span v-else>_</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建人" width="100" prop="creator_name"></el-table-column>
      <el-table-column align="center" label="创建时间" width="160" prop="create_time">
        <template slot-scope="scope">
          <span>{{scope.row.create_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="修改人" width="100" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改时间" width="160" prop="modify_time">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>

      <el-table-column fixed="right" align="center" :label="$t('table.actions')" width="160" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.is_deleted" type="primary" size="mini" @click="handleUpdate(scope.row)">{{$t('table.edit')}}</el-button>
          <el-button v-if="!scope.row.is_deleted" size="mini" type="danger" @click="handleDelete(scope.row)">{{$t('table.discontinue')}}</el-button>
          <el-button v-if="scope.row.is_deleted" size="mini" type="info" @click="handleRecover(scope.row)">恢复</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :inline="true" ref="dataForm" :model="temp" label-position="left" label-width="120px" style='width: 900px; margin-left:50px;'>
        <el-form-item label="ID" prop="id">
          <el-input v-model="temp.id"></el-input>
        </el-form-item>
        <el-form-item label="简称" prop="coin_code" class="item-right">
          <el-input v-model="temp.coin_code"></el-input>
        </el-form-item>
        <el-form-item label="英文名称" prop="coin_name">
          <el-input v-model="temp.coin_name"></el-input>
        </el-form-item>
        <el-form-item label="中文名称" prop="coin_name_ch" class="item-right">
          <el-input v-model="temp.coin_name_ch"></el-input>
        </el-form-item>
        <el-form-item label="是否是计价币种" prop="is_main_coin" style="width: 300px;">
          <el-radio v-model="temp.is_main_coin" label='Y'>是</el-radio>
          <el-radio v-model="temp.is_main_coin" label='N'>否</el-radio>
        </el-form-item>
        <el-form-item label="是否OTC交易" prop="is_trade" class="item-right">
          <el-radio-group v-model="temp.is_trade">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="能否充值" prop="is_recharge" style="width: 300px;">
          <el-radio v-model="temp.is_recharge" label='Y'>是</el-radio>
          <el-radio v-model="temp.is_recharge" label='N'>否</el-radio>
        </el-form-item>
        <el-form-item label="能否取现" prop="is_withdraw_cash" class="item-right">
          <el-radio v-model="temp.is_withdraw_cash" label='Y'>是</el-radio>
          <el-radio v-model="temp.is_withdraw_cash" label='N'>否</el-radio>
        </el-form-item>
        <el-form-item label="充值精度(预留)" prop="recharge_precision">
          <el-input-number v-model="temp.recharge_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="取现精度" prop="withdraw_precision" class="item-right">
          <el-input-number v-model="temp.withdraw_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="OTC交易精度" prop="otc_precision">
          <el-input-number v-model="temp.otc_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="保证金精度" prop="deposit_precision" class="item-right">
          <el-input-number v-model="temp.deposit_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="BTC兑换汇率" prop="btc_exchange_rate">
          <el-input-number v-model="temp.btc_exchange_rate" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="数字币图标" style="width: 600px;">
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
          <span style="color: red;">图标尺寸为32*32pix</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <!--图片查看-->
    <transition name="slide-fade" class="fadeView">
      <div v-if="showImg">
        <image-view :imgArr="imgArr"
                    :showImageView="true"
                    :imageIndex="0"
                    v-on:hideImage="hideImageView"></image-view>
      </div>
    </transition>

  </div>
</template>

<script>
  import { getCoinList } from '@/api/customer'
  import { coinFetchAll, coinCreate, coinDeleteById, coinUpdateById, coinRecoverById } from '@/api/system'
  import waves from '@/directive/waves' // 水波纹指令
  import { str2Bool, kebabCaseData2Camel } from '@/utils'
  import imageView from 'vue-imageview'

  export default {
    name: 'pushDraw',
    components: {
      'image-view': imageView
    },
    directives: {
      waves
    },
    data() {
      return {
        // uploadAction: '',
        coinList: [],
        uploadAction: 'http://192.168.60.199:8080/DaVaoBusiness/file/uploadImg?type=9',
        imgArr: '',
        showImg: false,
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        temp: {
          id: '',
          coin_code: '',
          coin_name: '',
          coin_name_ch: '',
          is_main_coin: 'Y',
          is_recharge: 'Y',
          is_withdraw_cash: 'Y',
          recharge_precision: '',
          withdraw_precision: '',
          otc_precision: '',
          deposit_precision: '',
          btc_exchange_rate: '',
          icon: '',
          is_trade: true
        },
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加'
        },
        rules: {
          id: [{ required: true, message: '请填写', trigger: 'blur' }],
          coin_code: [{ required: true, message: '请填写', trigger: 'blur' }],
          coin_name: [{ required: true, message: '请填写', trigger: 'blur' }],
          coin_name_ch: [{ required: true, message: '请填写', trigger: 'blur' }],
          is_main_coin: [{ required: true, message: '请填写', trigger: 'blur' }],
          is_trade: [{ required: true, message: '请填写', trigger: 'blur' }],
          is_recharge: [{ required: true, message: '请填写', trigger: 'blur' }],
          is_withdraw_cash: [{ required: true, message: '请填写', trigger: 'blur' }],
          recharge_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          withdraw_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          otc_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          deposit_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          btc_exchange_rate: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        // imageUrl: 'http://img3.redocn.com/20120410/Redocn_2012041007514574.jpg',
        imageUrl: '',
        updatingObj: ''
      }
    },
    created() {
      this.uploadAction = this.baseUrl + '/file/uploadImg?type=9'
      getCoinList().then(result => {
        this.coinList = result.data
      })
      this.getList()
    },
    methods: {
      showicon(row) {
        this.imgArr = [row.icon]
        this.showImg = true
      },
      hideImageView() {
        this.showImg = false
      },
      getList() {
        this.listLoading = true
        coinFetchAll(this.query).then(result => {
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
      handleDelete(row) {
        this.$confirm('确认停用?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          coinDeleteById(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            this.getList()
          })
        })
      },
      handleRecover(row) {
        this.$confirm('确认恢复?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          coinRecoverById(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '恢复成功!'
            })
            this.getList()
          })
        })
      },
      resetTemp() {
        this.temp = {
          id: '',
          coin_code: '',
          coin_name: '',
          coin_name_ch: '',
          is_main_coin: 'Y',
          is_recharge: 'Y',
          is_withdraw_cash: 'Y',
          recharge_precision: '3',
          withdraw_precision: '3',
          otc_precision: '3',
          deposit_precision: '3',
          btc_exchange_rate: '3',
          // icon: 'http://img.sccnn.com/bimg/338/24556.jpg'
          icon: '',
          is_trade: true
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.imageUrl = ''
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (!this.imageUrl) {
              this.$message.error('请上传图标！')
              return
            }
            const para = Object.assign({}, this.temp)
            para.is_main_coin = str2Bool(this.temp.is_main_coin)
            para.is_recharge = str2Bool(this.temp.is_recharge)
            para.is_withdraw_cash = str2Bool(this.temp.is_withdraw_cash)
            para.icon = this.imageUrl
            coinCreate(kebabCaseData2Camel(para)).then((data) => {
              this.query.currPage = 1
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdate(row) {
        this.updatingObj = row
        this.temp = Object.assign({}, row) // copy obj
        this.temp.is_main_coin = this.temp.is_main_coin ? 'Y' : 'N'
        this.temp.is_recharge = this.temp.is_recharge ? 'Y' : 'N'
        this.temp.is_withdraw_cash = this.temp.is_withdraw_cash ? 'Y' : 'N'
        this.imageUrl = this.temp.icon
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      getUpdatedObj(temp) {
        const newObj = { id: temp.id }
        Object.keys(temp).filter(attr => {
          return attr !== 'id'
        }).forEach(attr => {
          if (this.updatingObj[attr] !== temp[attr]) {
            newObj[attr] = temp[attr]
          }
        })
        return newObj
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            if (!this.imageUrl) {
              this.$message.error('请上传图标！')
              return
            }
            const para = Object.assign({}, this.temp)
            para.is_main_coin = str2Bool(this.temp.is_main_coin)
            para.is_recharge = str2Bool(this.temp.is_recharge)
            para.is_withdraw_cash = str2Bool(this.temp.is_withdraw_cash)
            para.icon = this.imageUrl
            coinUpdateById(kebabCaseData2Camel(this.getUpdatedObj(para))).then((res) => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '更新成功',
                type: 'success',
                duration: 2000
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
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      }
    }
  }
</script>
<style scoped>
  .item-right {
    margin-left: 60px;
  }
</style>
