sap.ui.define([
	"OpenOrderStatus/OpenOrderStatus/controller/BaseController",
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (BaseController, jQuery, Device, Filter, Sorter, JSONModel, MessageToast, Export, ExportTypeCSV) {
	"use strict";

	return BaseController.extend("OpenOrderStatus.OpenOrderStatus.controller.Order", {
		onInit: function () {
			var that = this;
			this._mViewSettingsDialogs = {};

//			var sPathOData = "/sap/opu/odata/sap/zbmtm_coll_portal_cte_srv";

			var oModel = new sap.ui.model.json.JSONModel("model/Orders.json");
//			var oModel = new sap.ui.model.odata.v2.ODataModel(sPathOData, { 
//				json: true,
//				defaultCountMode: sap.ui.model.odata.CountMode.None
//			});
//			oModel.attachRequestFailed(this, this.onODataRequestFailed, null);
//			oModel.attachRequestCompleted(this, this.onODataRequestCompleted, null);
//			oModel.getSecurityToken();			

			oModel.attachRequestCompleted(function(oEvent) {
				that.setTextTitleBar(); 
			});
			
			this.getView().setModel(oModel);
		},
		
//		onAfterRendering: function() {
//			this._oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
//		},		

		onExit: function () {
			var oDialogKey,
				oDialogValue;

			for (oDialogKey in this._mViewSettingsDialogs) {
				oDialogValue = this._mViewSettingsDialogs[oDialogKey];

				if (oDialogValue) {
					oDialogValue.destroy();
				}
			}
		},
		
		setTextTitleBar: function() {
			var count = this.getView().byId("tbOrder").getItems().length;
			if (count > 0) {
				var label = this.getResourceBundle().getText("openOrders");
				this.getView().byId("tlTitleBar").setText(label + " (" + count + ")");
			}
		},
		
		onSelectVariant: function (oEvent) {
			var selected = this.getView().byId("variant")._getSelectedItem().getText();
			this.showMessage("Selecionou variante " + selected);	
		},
		
		onClickSearch: function () {
			this.showMessage("Realiza a pesquisa aplicando os filtros");
		},

		onClickClear: function () {
			this.getView().byId("slFilter").setValue(null);
			this.getView().byId("slCustomerPo").setSelectedKey(0);
			this.getView().byId("slShipTo").setSelectedKey(0);
			this.getView().byId("slCustomerMatnr").setSelectedKey(0);
			this.getView().byId("slOrder").setSelectedKey(0);
			this.getView().byId("slPlant").setSelectedKey(0);
		},

		createViewSettingsDialog: function (sDialogFragmentName) {
			var oDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!oDialog) {
				// Instancia o fragment
				oDialog = sap.ui.xmlfragment(sDialogFragmentName, this);
				var i18nModel = new sap.ui.model.resource.ResourceModel({
                    bundleUrl : "i18n/i18n.properties"
                });
                // Seta a internacionalização
                oDialog.setModel(i18nModel, "i18n");  				
				
				this._mViewSettingsDialogs[sDialogFragmentName] = oDialog;

				if (Device.system.desktop) {
					oDialog.addStyleClass("sapUiSizeCompact");
				}
			}
			return oDialog;
		},

		onClickSort: function () {
			this.createViewSettingsDialog("OpenOrderStatus.OpenOrderStatus.fragments.SortDialog").open();
		},

		onClickFilter: function () {
			this.createViewSettingsDialog("OpenOrderStatus.OpenOrderStatus.fragments.FilterDialog").open();
		},
		
		onClickPerso: function() {
			this.showMessage("Personalização acionada!");
		},
		
		onClickExport: sap.m.Table.prototype.exportData || function(oEvent) {
			var oExport = new Export({
				exportType : new ExportTypeCSV({
					separatorChar : ";"
				}),

				// Pass in the model created above
				models : this.getView().getModel(),
				// binding information for the rows aggregation
				rows : {
					path : "/OrderCollection"
				},
				// column definitions with column name and binding info for the content
				columns : [
					{
						name : "Cust P.O.",
						template : {
							content : "{CustPO}"
						}
					},
					{
						name : "Customer Matnr",
						template : {
							content : "{Matnr}"
						}
					}, 
					{
						name : "Order",
						template : {
							content : "{Order}"
						}
					},
					{
						name : "Description",
						template : {
							content : "{Description}"
						}
					},
					{
						name : "Ordered",
						template : {
							content : "{Ordered}"
						}
					},
					{
						name : "Delivered",
						template : {
							content : "{Delivered}"
						}
					},
					{
						name : "Scheduled",
						template : {
							content : "{Scheduled}"
						}
					},
					{
						name : "Balance",
						template : {
							content : "{Balance}"
						}
					},
					{
						name : "Ready t.Ship",
						template : {
							content : "{ReadyShip}"
						}
					}					
				]
			});
			// download exported file
			oExport.saveFile().catch(function(oError) {
				MessageToast.error("Error ao exportar arquivo" + oError);
			}).then(function() {
				oExport.destroy();
			});
		},
		
		onClickPrint: function(oEvent) {
			this.showMessage("Imprissão acionada!");	
		},
		
		onClickDetail: function(oEvent) {
			var sPath  = oEvent.getSource().getBindingContext().getPath();
			var oModel = oEvent.getSource().getModel();
			var oRow   = oModel.getProperty(sPath);
			
			this.getRouter().navTo("Detail", { order: oRow.Order });	
		},
		
		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("tbOrder"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.byId("tbOrder"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		}	
		
/*		createColumnConfig: function () {
			var aCols = [];

			aCols.push({
				label: 'Descrição Full',
				property: ['Name', 'Description'],
				type: 'string',
				template: '{0}, {1}'
			});

			aCols.push({
				label: 'ID',
				type: 'number',
				property: 'ID',
				scale: 0
			});

			aCols.push({
				property: 'Name',
				type: 'string'
			});

			aCols.push({
				property: 'Description',
				type: 'string'
			});

			//			aCols.push({
			//				property: 'Birthdate',
			//				type: 'date'
			//			});

			//			aCols.push({
			//				property: 'Salary',
			//				type: 'number',
			//				scale: 2,
			//				delimiter: true
			//			});

			//			aCols.push({
			//				property: 'Currency',
			//				type: 'string'
			//			});

			//			aCols.push({
			//				property: 'Active',
			//				type: 'boolean',
			//				trueValue: 'YES',
			//				falseValue: 'NO'
			//			});

			return aCols;
		},

		onExport: function () {
			var aCols, oRowBinding, oSettings, oTable;

			if (!this._oTable) {
				this._oTable = this.byId("tbOrder");
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding("items");

			aCols = this.createColumnConfig();

			var oModel = oRowBinding.getModel();
			var oModelInterface = oModel.getInterface();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: {
					type: "json",
					dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
					serviceUrl: oModelInterface.sServiceUrl,
					headers: oModelInterface.getHeaders ? oModelInterface.getHeaders() : null,
					count: oRowBinding.getLength ? oRowBinding.getLength() : null,
					//					useBatch: oModelInterface.bUseBatch,
					sizeLimit: oModelInterface.iSizeLimit
				},
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			new Spreadsheet(oSettings).build();
		},*/
	});
});