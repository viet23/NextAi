import { useForm, useWatch } from "antd/es/form/Form";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  FULL_DATE_FORMAT_PARAM,
  TIME_FILTER_TYPE_DAY,
  TIME_FILTER_TYPE_DEFAULT,
  TIME_FILTER_TYPE_MONTH,
  TIME_FILTER_TYPE_VALUES,
  TIME_FILTER_TYPE_WEEK,
} from "src/constants/common.constants";
import { REPORT_TYPE_VALUES } from "src/constants/user-growth-reports.constants";
import { UserGrowthReportGroupEnum } from "src/enums/user-growth-reports.enum";
import {
  IPeriodValueType,
  IUserGrowthReport,
  IUserGrowthReportFilter,
  IUserGrowthReportRow,
} from "src/interfaces/user-growth-reports.interface";
import {
  useGetUserGrowthReportsQuery,
  useLazyExportUserGrowthReportExcelQuery,
} from "src/store/api/userGrowthReportApi";
import { formatNumber } from "src/utils/number-utils";

type FormType = {
  type?: (typeof REPORT_TYPE_VALUES)[number];
  dateFilterType: (typeof TIME_FILTER_TYPE_VALUES)[number];
  dateFilter?: dayjs.Dayjs;
  dateRangeFilter?: dayjs.Dayjs[];
};

export const useUserGrowthReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = useForm<FormType>();
  const dateFilterTypeWatch = useWatch("dateFilterType", form);

  const [currentFilters, setCurrentFilters] = useState<IUserGrowthReportFilter | null>(null);
  const [isSkip, setIsSkip] = useState(true);

  const { data, refetch } = useGetUserGrowthReportsQuery(currentFilters, {
    skip: isSkip,
  });
  const [exportExcel] = useLazyExportUserGrowthReportExcelQuery();

  const getTargetName = (target: UserGrowthReportGroupEnum) => {
    switch (target) {
      case UserGrowthReportGroupEnum.ALL:
        return "Tổng user";
      case UserGrowthReportGroupEnum.ONLINE:
        return "Đang hoạt động";
      case UserGrowthReportGroupEnum.OFFLINE:
        return "Chưa hoạt động";
      case UserGrowthReportGroupEnum.CREATE_NEW:
        return "Tạo mới";
      case UserGrowthReportGroupEnum.VERIFIED:
        return "Đã xác thực";
      case UserGrowthReportGroupEnum.AUTHEN_FAILED:
        return "Xác thực thất bại";
      case UserGrowthReportGroupEnum.LOCK:
        return "Khoá vĩnh viễn/khoá tạm thời";
      case UserGrowthReportGroupEnum.UNKNOWN:
        return "Tài khoản đổi trạng thái xác thực do KH yêu cầu";
      default:
        return "";
    }
  };

  const columns = useMemo<ColumnsType<IUserGrowthReportRow>>(
    () => [
      {
        title: "STT",
        dataIndex: "index",
        key: "index",
        width: 100,
      },
      {
        title: "Chỉ số/Chỉ tiêu",
        dataIndex: "target",
        key: "target",
        render: value => getTargetName(value),
        width: 300,
      },
      {
        title: "Biến động trong kỳ",
        dataIndex: "week",
        key: "week",
        align: "end",
        render: value => (formatNumber(value) === "0" ? "-" : formatNumber(value)),
      },
      {
        title: "Luỹ kế tháng",
        dataIndex: "month",
        key: "month",
        align: "end",
        render: value => (formatNumber(value) === "0" ? "-" : formatNumber(value)),
      },
      {
        title: "Luỹ kế tổng",
        key: "cumulative",
        dataIndex: "cumulative",
        align: "end",
        render: value => (formatNumber(value) === "0" ? "-" : formatNumber(value)),
      },
    ],
    []
  );

  const initFormValues = useMemo<FormType>(() => {
    let init: FormType = {
      dateFilterType: TIME_FILTER_TYPE_DEFAULT,
    };

    if (
      searchParams.get("dateFilterType") &&
      TIME_FILTER_TYPE_VALUES.includes(Number(searchParams.get("dataFilterType")))
    )
      init.dateFilterType = Number(searchParams.get("dateFilterType"));

    if (searchParams.get("type") && REPORT_TYPE_VALUES.includes(searchParams.get("type")!))
      init.type = searchParams.get("type")!;

    if (searchParams.get("startDate") && searchParams.get("endDate")) {
      const startDate = dayjs(searchParams.get("startDate"));
      const isStartDateValid = startDate.isValid();
      const endDate = dayjs(searchParams.get("endDate"));
      const isEndDateValid = endDate.isValid();

      if (isStartDateValid && isEndDateValid) {
        switch (init.dateFilterType) {
          case TIME_FILTER_TYPE_DAY:
          case TIME_FILTER_TYPE_WEEK:
          case TIME_FILTER_TYPE_MONTH:
            init.dateFilter = startDate;
            break;

          default:
            init.dateRangeFilter = [startDate, endDate];
            break;
        }
      }
    }

    return init;
  }, [searchParams]);

  const convertResponseToRowTable = (data: IUserGrowthReport): IUserGrowthReportRow[] => {
    const createLookup = (arr: IPeriodValueType[]) =>
      arr.reduce<{
        [k: string]: number;
      }>((acc, { count, statusGroup }) => {
        acc[statusGroup] = +count;
        return acc;
      }, {});

    const weekLookup = createLookup(data.week as IPeriodValueType[]);
    const monthLookup = createLookup(data.month as IPeriodValueType[]);
    const cumulativeLookup = createLookup(data.cumulative as IPeriodValueType[]);

    const allStatusGroups = new Set([
      ...data.week.map(({ statusGroup }) => statusGroup),
      ...data.month.map(({ statusGroup }) => statusGroup),
      ...data.cumulative.map(({ statusGroup }) => statusGroup),
    ]);

    const groups = Array.from(allStatusGroups).map<IUserGrowthReportRow>(statusGroup => ({
      target: statusGroup,
      week: weekLookup[statusGroup] || 0,
      month: monthLookup[statusGroup] || 0,
      cumulative: cumulativeLookup[statusGroup] || 0,
      children: statusGroup === UserGrowthReportGroupEnum.OFFLINE ? [] : undefined,
    }));

    const offlineGroup = groups.find(x => x.target === UserGrowthReportGroupEnum.OFFLINE);
    if (offlineGroup) {
      offlineGroup.children = [
        groups.find(x => x.target === UserGrowthReportGroupEnum.CREATE_NEW),
        groups.find(x => x.target === UserGrowthReportGroupEnum.VERIFIED),
        groups.find(x => x.target === UserGrowthReportGroupEnum.AUTHEN_FAILED),
        groups.find(x => x.target === UserGrowthReportGroupEnum.LOCK),
        groups.find(x => x.target === UserGrowthReportGroupEnum.UNKNOWN),
      ]
        .filter(Boolean)
        .reduce<IUserGrowthReportRow[]>((acc, item, index) => {
          if (!item) return acc;
          item.index = `3.${index + 1}`;
          return [...acc, item];
        }, []);
    }

    return [
      groups.find(x => x.target === UserGrowthReportGroupEnum.ALL)!,
      groups.find(x => x.target === UserGrowthReportGroupEnum.ONLINE)!,
      groups.find(x => x.target === UserGrowthReportGroupEnum.OFFLINE)!,
    ].map((x, index) => ({ ...x, index: (index + 1).toString() }));
  };

  const convertFormDataToFilters = (values: FormType): IUserGrowthReportFilter => {
    let startDate = "";
    let endDate = "";
    if (values.dateRangeFilter) {
      const [sd, ed] = values.dateRangeFilter.map((v: dayjs.Dayjs) =>
        v.format(FULL_DATE_FORMAT_PARAM)
      );
      startDate = sd;
      endDate = ed;
    } else if (values.dateFilter) {
      const unit = dateFilterTypeWatch === TIME_FILTER_TYPE_MONTH ? "year" : "month";
      startDate = values.dateFilter.startOf(unit).format(FULL_DATE_FORMAT_PARAM);
      endDate = values.dateFilter.endOf(unit).format(FULL_DATE_FORMAT_PARAM);
    }

    return {
      where: {
        type: values.type!,
        dateFilterType: values.dateFilterType.toString(),
        startDate,
        endDate,
      },
    };
  };

  const dataSource = useMemo(() => (data ? convertResponseToRowTable(data) : []), [data]);

  const handleChangeType = () => {
    form.setFieldValue("dateFilter", undefined);
    form.setFieldValue("dateRangeFilter", undefined);
  };

  const handleOnFinish = async (values: FormType) => {
    const newFilters = convertFormDataToFilters(values);
    setIsSkip(false);
    setCurrentFilters(newFilters);
    navigate(
      {
        pathname: location.pathname,
        search: new URLSearchParams({ ...newFilters.where }).toString(),
      },
      { replace: true }
    );
  };

  const handleExport = async () => {
    await exportExcel(currentFilters!);
  };

  const handleRefetch = () => {
    refetch();
  };

  const handleResetField = () => {
    setSearchParams(undefined);
    form.resetFields();
  };

  useEffect(() => {
    if (!searchParams.size) {
      form.resetFields();
      setIsSkip(true);
    }
  }, [form, searchParams.size]);

  return {
    form,
    initFormValues,
    dateFilterTypeWatch,
    columns,
    isSkip,
    dataSource,
    handleChangeType,
    handleResetField,
    handleRefetch,
    handleExport,
    handleOnFinish,
  };
};
