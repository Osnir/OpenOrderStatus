sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/m/MessageBox",
		"sap/m/MessageToast"
	], function (Controller, MessageBox, MessageToast) {
		"use strict";

		return Controller.extend("OpenOrderStatus.OpenOrderStatus..controller.BaseController", {
			
			getServiceUrl : function (oData) {
				//var url = window.location.protocol + "//" + window.location.host + "/sap/opu/odata/sap/ZYFREQUENCIA_SRV";
				var url = "/sap/opu/odata/sap/ZYFREQUENCIA_SRV";
				if (oData) url = url + oData; 
				
				return url;
			},
			
			showSuccessMessage : function (message) {
				MessageBox.success(message, {
				    title: "Aviso",
				    onClose: null
			    });
			},

			showErrorMessage : function (message) {			
				MessageBox.error(message, {
				    title: "Erro",
				    onClose: null
			    });
			},
			
			showMessage : function (message) {
				MessageToast.show(message, {
					my: "center",
					at: "center"
				});
			},
			
			getRouter : function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
			
			getResourceBundle : function () {
				if (!this._oResourceBundle) {
					this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				}
				
				return this._oResourceBundle;
			},
			
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},
	
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			}
		});
	}
);
