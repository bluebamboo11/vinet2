angular.module('MyApp', ['ngMaterial','data-table'])

    .controller('AppCtrl', function ($scope, $http) {
        $scope.dateLocale = {
            formatDate: function(date) {
                var m = moment(date);
                return m.isValid() ? m.format('DD / MM / YYYY') : '';
            }
        };

        $scope.options = {
            rowHeight: 50,
            headerHeight: 50,
            footerHeight: 50,
            columns: [{
                name: "Mã Đơn hàng",
                prop: "name"
            }, {
                name: "Ngày",
                prop: "gender"
            }, {
                name: "Số điện thoại",
                prop: "company"
            }],
            columnMode: 'force',
            paging: {
                externalPaging: true
            }
        };

        $scope.paging = function(offset, size) {
            $http.get('node_modules/angular-data-table/demos/data/100.json').success(function(d) {
                $scope.options.paging.count = d.length;

                var set = d.splice(offset, size);
                if (!$scope.data) {
                    $scope.data = set;
                } else {
                    // only insert items i don't already have
                    set.forEach(function(r, i) {
                        var idx = i + (offset * size);
                        $scope.data[idx] = r;
                    });
                }

                console.log('paging!', offset, size)
            });
        };

    })
    .config(function ($mdDateLocaleProvider) {
        $mdDateLocaleProvider.months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
        $mdDateLocaleProvider.shortMonths = ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'];
        $mdDateLocaleProvider.days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        $mdDateLocaleProvider.shortDays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

    });
