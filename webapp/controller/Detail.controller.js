sap.ui.define([
	"OpenOrderStatus/OpenOrderStatus/controller/BaseController"
], function (BaseController) {
	"use strict";

	var _order;
	
	return BaseController.extend("OpenOrderStatus.OpenOrderStatus.controller.Detail", {

		onInit: function() {
			this.getRouter().attachRouteMatched(this._onRouteFound, this);
		},
		
		_onRouteFound: function(oEvent) {
			if (!oEvent || oEvent.getParameters().name === "Detail") {
				var oArgument = oEvent.getParameters().arguments;
				_order = oArgument.order;
				
				this.loadPage();
			}
		},
		
		loadPage: function () {
			var json = {
		      "CustPO": "4500408107-421692-M2",
		      "CustMatnr": "M1006001300D",
		      "Order": "187524-1",
		      "Matnr": "21003815",
		      "Description": "60.00mmX13.00mm RE-SAE 5160H 7950mm",
	    	  "SoldTo": "SUMITOMO CANADA LIMITED",
		      "ShipTo": "RASSINI SUSPENSIONES S.A. DE C.V. Piedras Negras"
		    };
		    
			var oModel = new sap.ui.model.json.JSONModel(json);
			this.getView().setModel(oModel);
		}

	});
});