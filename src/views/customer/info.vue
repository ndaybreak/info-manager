<template>
  <div class="app-container">
    <div class="filter-container">
      <!--<el-input style="width: 200px;" class="filter-item" placeholder="请输入UID" v-model="query.id"></el-input>-->
      <el-input style="width: 200px;" class="filter-item" placeholder="请输入账号" v-model="query.account"></el-input>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.isFrozen" @change="handleFilter" placeholder="请选择账号状态">
        <el-option v-for="item in statusList" :key="item.id" :label="item.label" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" v-model="query.customerLevelId" placeholder="请选择客户参数" @change="handleFilter">
        <el-option v-for="item in customerList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" v-model="query.merchantLevelId" placeholder="请选择商户参数" @change="handleFilter">
        <el-option v-for="item in merchantList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable class="filter-item" v-model="query.agentLevelId" placeholder="请选择经纪人参数" @change="handleFilter">
        <el-option v-for="item in agentList" :key="item.id" :label="item.description" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleFilter" type="primary" icon="el-icon-search">查询</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleActivity" type="warning">活动</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <!--<el-table-column align="center" label="UID" width="50" prop="id"></el-table-column>-->
      <el-table-column align="center" label="邮箱" width="150" prop="email"></el-table-column>
      <el-table-column align="center" label="区号" width="50" prop="area_code"></el-table-column>
      <el-table-column align="center" label="电话" width="120" prop="mobile_number"></el-table-column>
      <el-table-column align="center" label="账户状态" width="120">
        <template slot-scope="scope">
          <span>{{scope.row.is_frozen | statusFilter}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="客户等级" width="120" prop="customer_level_id"></el-table-column>
      <el-table-column align="center" label="客户参数说明" width="120" prop="customer_level_description"></el-table-column>
      <el-table-column align="center" label="商户等级" width="120" prop="merchant_level_id"></el-table-column>
      <el-table-column align="center" label="商户参数说明" width="120" prop="merchant_level_description"></el-table-column>
      <el-table-column align="center" label="经纪人参数说明" width="120" prop="agent_level_description"></el-table-column>
      <el-table-column align="center" label="修改人" width="120" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改日期" width="160">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="310" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" @click="showDetail(scope.row)">明细</el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-if="scope.row.is_frozen" size="mini" type="warning" @click="handleUnfrozen(scope.row)">解冻</el-button>
          <el-button v-else type="danger" size="mini" @click="handleFrozen(scope.row)">冻结</el-button>
          <el-button type="primary" size="mini" @click="adjustAsset(scope.row)">调仓</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="query.currPage" :page-sizes="[15,30,50,100]" :page-size="query.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog title="基本信息" :visible.sync="detailDialogVisible">
      <div class="info" style="line-height: 3;">
        <el-row>
          <el-col :span="4">姓名：</el-col><el-col :span="6"> {{tempInfo.full_name}}</el-col>
          <el-col :span="4">性别：</el-col><el-col :span="6"> {{tempInfo.sex}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">出生日期：</el-col><el-col :span="6"> {{tempInfo.birthday}}</el-col>
          <el-col :span="4">邮编：</el-col><el-col :span="6"> {{tempInfo.postal_code}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">所在城市：</el-col><el-col :span="6"> {{tempInfo.city}}</el-col>
          <el-col :span="4">家庭住址：</el-col><el-col :span="10"> {{tempInfo.address}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">国家/地区代码：</el-col><el-col :span="6"> {{tempInfo.area_code}}</el-col>
          <el-col :span="4">国家/地区简称：</el-col><el-col :span="6"> {{tempInfo.country_abbr}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">发证国家/地区简称：</el-col><el-col :span="6"> {{tempInfo.credential_sign_pic_addr}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">手机号：</el-col><el-col :span="6"> {{tempInfo.mobile_number}}</el-col>
          <el-col :span="4">邮箱：</el-col><el-col :span="6"> {{tempInfo.email}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">邀请码：</el-col><el-col :span="6"> {{tempInfo.invite_code}}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4">证件图：</el-col>
        </el-row>
        <PictureView v-if="tempInfo.icons" :pictureList="tempInfo.icons" width="50" height="50"></PictureView>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="编辑" :visible.sync="dialogFormVisible" class="slim-dialog">
      <el-form :rules="rules"  ref="updateForm" :model="temp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="交易参数" prop="customer_level_id">
          <el-select class="filter-item" v-model="temp.customer_level_id" placeholder="请选择">
            <el-option v-for="item in customerList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商户参数" prop="merchant_level_id">
          <el-select class="filter-item" v-model="temp.merchant_level_id" placeholder="请选择">
            <el-option v-for="item in merchantList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="经纪人参数" prop="agent_level_id">
          <el-select class="filter-item" v-model="temp.agent_level_id" placeholder="请选择">
            <el-option v-for="item in agentList" :key="item.id" :label="item.description" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="调仓" :visible.sync="adjustDialogVisible" class="slim-dialog">
      <el-form :rules="adjustRules"  ref="adjustForm" :model="adjustTemp" label-position="left" label-width="100px" style='width: 400px; margin-left:50px;'>
        <el-form-item label="数字币名称" prop="coinId">
          <el-select class="filter-item" v-model="adjustTemp.coinId" placeholder="请选择">
            <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isActivity" label="调整类型" prop="type">
          <el-select class="filter-item" v-model="adjustTemp.type" placeholder="请选择">
            <el-option v-for="item in typeList" :key="item.id" :label="item.label" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="调整数量" prop="quantity">
          <el-input-number v-model="adjustTemp.quantity" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="info">
          <el-input type="textarea" :rows="5" placeholder="请输入内容" v-model="adjustTemp.info"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="adjustDialogVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="adjustConfirm">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { infoFetchAll, infoUpdate, getCustomerList, getMerchantList,
    getAgentList, infoFrozen, infoUnfrozen, infoDetail, getCoinList, infoAdjustPlus, infoAdjustMinus, infoAdjustPlusAll } from '@/api/customer'
  import waves from '@/directive/waves' // 水波纹指令
  import imageView from 'vue-imageview'
  import PictureView from 'vue-simple-picture-preview'

  export default {
    name: 'deal',
    components: {
      'image-view': imageView,
      PictureView
    },
    filters: {
      statusFilter(isFrozen) {
        return isFrozen ? '冻结' : '正常'
      }
    },
    directives: {
      waves
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: null,
        listLoading: true,
        query: {
          currPage: 1,
          pageSize: 15
        },
        temp: {
        },
        tempInfo: {},
        adjustTemp: {},
        dialogFormVisible: false,
        detailDialogVisible: false,
        adjustDialogVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加'
        },
        rules: {
          customer_level_id: [{ required: true, message: '请填写', trigger: 'blur' }],
          merchant_level_id: [{ required: true, message: '请填写', trigger: 'blur' }],
          agent_level_id: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        adjustRules: {
          coinId: [{ required: true, message: '请填写', trigger: 'blur' }],
          type: [{ required: true, message: '请填写', trigger: 'blur' }],
          quantity: [{ required: true, message: '请填写', trigger: 'blur' }],
          info: [{ required: false, message: '请填写', trigger: 'blur' }]
        },
        updatingObj: '',
        statusList: [{
          id: true,
          label: '冻结'
        }, {
          id: false,
          label: '正常'
        }],
        typeList: [{
          id: 'plus',
          label: '调增'
        }, {
          id: 'minus',
          label: '调减'
        }],
        customerList: [],
        merchantList: [],
        agentList: [],
        coinList: [],
        isActivity: false
      }
    },
    created() {
      this.getList()
      this.getStaticData()
    },
    methods: {
      getStaticData() {
        getCustomerList().then(result => {
          this.customerList = result.data
        })
        getAgentList().then(result => {
          this.agentList = result.data
        })
        getMerchantList().then(result => {
          this.merchantList = result.data
        })
        getCoinList().then(result => {
          this.coinList = result.data
        })
      },
      getList() {
        this.listLoading = true
        infoFetchAll(this.query).then(result => {
          this.listLoading = false
          this.list = result.data
          this.total = result.pageInfo.totalCount
          if (this.list.length === 0 && this.query.currPage !== 1) {
            this.getList()
          }
        })
      },
      showDetail(row) {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        infoDetail({ id: row.id }).then(result => {
          this.tempInfo = result.data
          this.tempInfo.icons = []
          this.tempInfo.credential_front_pic_addr && this.tempInfo.icons.push(this.tempInfo.credential_front_pic_addr)
          this.tempInfo.credential_back_pic_addr && this.tempInfo.icons.push(this.tempInfo.credential_back_pic_addr)
          this.tempInfo.credential_sign_pic_addr && this.tempInfo.icons.push(this.tempInfo.credential_sign_pic_addr)
          this.tempInfo.full_name = row.full_name
          this.tempInfo.email = row.email
          this.tempInfo.mobile_number = row.mobile_number
          loading.close()
          this.detailDialogVisible = true
        }).catch(e => {
          loading.close()
        })
      },
      handleFilter() {
        this.query.currPage = 1
        this.getList()
      },
      handleUnfrozen(row) {
        this.$confirm('确认解冻账号?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          infoUnfrozen({ id: row.id }).then(res => {
            this.getList()
            this.$message({
              message: '操作成功',
              type: 'success'
            })
          })
        })
      },
      handleFrozen(row) {
        this.$confirm('确认冻结账号?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          infoFrozen({ id: row.id }).then(res => {
            this.getList()
            this.$message({
              message: '操作成功',
              type: 'success'
            })
          })
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
      handleUpdate(row) {
        this.updatingObj = row
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['updateForm'].clearValidate()
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
        this.$refs['updateForm'].validate((valid) => {
          if (valid) {
            const para = Object.assign({}, this.temp)
            infoUpdate(this.getUpdatedObj(para)).then((res) => {
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
      adjustAsset(row) {
        this.adjustTemp = {
          accountId: row.id
        }
        this.isActivity = false
        this.adjustRules.type[0].required = true
        this.adjustDialogVisible = true
      },
      handleActivity() {
        this.adjustTemp = {}
        this.isActivity = true
        this.adjustRules.type[0].required = false
        this.adjustDialogVisible = true
      },
      adjustConfirm() {
        this.$refs['adjustForm'].validate((valid) => {
          if (valid) {
            let action
            if (this.adjustTemp.type === 'plus') {
              action = infoAdjustPlus
            } else if (this.adjustTemp.type === 'minus') {
              action = infoAdjustMinus
            } else {
              action = infoAdjustPlusAll
            }
            action(this.adjustTemp).then((res) => {
              // this.getList()
              this.adjustDialogVisible = false
              this.$notify({
                title: '成功',
                message: '调仓成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      }
    }
  }
</script>
<style scoped>
  .item-right {
    margin-left: 60px;
  }
</style>
