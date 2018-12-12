<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.targetCoinId" @change="handleFilter" placeholder="请选择基础币">
        <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-select clearable style="width: 150px" class="filter-item" v-model="query.marketCoinId" @change="handleFilter" placeholder="请选择计价币">
        <el-option v-for="item in marketCoinList" :key="item.id" :label="item.coin_code" :value="item.id">
        </el-option>
      </el-select>
      <el-button class="filter-item" style="margin-left: 10px;" @click="handleCreate" type="primary" icon="el-icon-edit">{{$t('table.add')}}</el-button>
    </div>

    <el-table :data="list" v-loading="listLoading" border fit highlight-current-row
              style="width: 100%;min-height:500px;">
      <!--<el-table-column align="center" label="序号" width="50" prop="id"></el-table-column>-->
      <el-table-column align="center" label="交易对" width="150">
        <template slot-scope="scope">
          <span>{{scope.row.target_coin_code}}/{{scope.row.market_coin_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="基础币" width="120" prop="target_coin_code"></el-table-column>
      <el-table-column align="center" label="计价币" width="120" prop="market_coin_code"></el-table-column>
      <el-table-column align="center" label="基础币交易精度" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.target_precision}} {{scope.row.target_coin_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="计价币交易精度" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.market_precision}} {{scope.row.market_coin_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="最小下单总额" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.market_min_quantity}} {{scope.row.market_coin_code}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建人" width="120" prop="creator_name"></el-table-column>
      <el-table-column align="center" label="修改人" width="120" prop="modifier_name"></el-table-column>
      <el-table-column align="center" label="修改日期" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.modify_time | parseTime}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
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
        <el-form-item label="基础币" prop="target_coin_id">
          <el-select clearable style="width: 150px" class="filter-item" v-model="temp.target_coin_id" placeholder="请选择">
            <el-option v-for="item in coinList" :key="item.id" :label="item.coin_code" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基础币交易精度" prop="target_precision" class="item-right">
          <el-input-number v-model="temp.target_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="计价币" prop="market_coin_id">
          <el-select clearable style="width: 150px" class="filter-item" v-model="temp.market_coin_id" placeholder="请选择">
            <el-option v-for="item in marketCoinList" :key="item.id" :label="item.coin_code" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计价币交易精度" prop="market_precision" class="item-right">
          <el-input-number v-model="temp.market_precision" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
        <el-form-item label="最小下单总额" prop="market_min_quantity">
          <el-input-number v-model="temp.market_min_quantity" :precision="6" :step="0.01"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{$t('table.cancel')}}</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">{{$t('table.confirm')}}</el-button>
        <el-button v-else type="primary" @click="updateData">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
  import { getCoinList } from '@/api/customer'
  import { dealFetchAll, dealCreate, dealDelete, dealUpdate, dealRecover } from '@/api/system'
  import waves from '@/directive/waves' // 水波纹指令
  import imageView from 'vue-imageview'

  export default {
    name: 'deal',
    components: {
      'image-view': imageView
    },
    directives: {
      waves
    },
    data() {
      return {
        coinList: [],
        marketCoinList: [],
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
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑',
          create: '添加'
        },
        rules: {
          target_coin_id: [{ required: true, message: '请选择', trigger: 'blur' }],
          market_coin_id: [{ required: true, message: '请选择', trigger: 'blur' }],
          target_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          market_precision: [{ required: true, message: '请填写', trigger: 'blur' }],
          market_min_quantity: [{ required: true, message: '请填写', trigger: 'blur' }]
        },
        updatingObj: ''
      }
    },
    created() {
      getCoinList().then(result => {
        this.coinList = result.data
      })
      getCoinList({ isMainCoin: true }).then(result => {
        this.marketCoinList = result.data
      })
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        dealFetchAll(this.query).then(result => {
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
          dealDelete(row.id).then(res => {
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
          dealRecover(row.id).then(res => {
            this.$message({
              type: 'success',
              message: '恢复成功!'
            })
            this.getList()
          })
        })
      },
      resetTemp() {
        this.temp = {}
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const para = Object.assign({}, this.temp)
            dealCreate(para).then((data) => {
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
            const para = Object.assign({}, this.temp)
            dealUpdate(this.getUpdatedObj(para)).then((res) => {
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
