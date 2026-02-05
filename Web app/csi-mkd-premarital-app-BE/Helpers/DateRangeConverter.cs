using System;
using System.Globalization;
using TimeZoneConverter;

namespace csi_mkd_premarital_app_BE.Helpers
{
public static class DateRangeConverter
{
    public static (DateTimeOffset UtcStart, DateTimeOffset UtcEnd)
        BuildUtcDateRange(
            string startDateIso,
            string endDateIso,
            string ianaTimeZone)
    {
        var timeZone = TZConvert.GetTimeZoneInfo(ianaTimeZone);

        // Parse only the DATE portion
        var startDate = DateTime.Parse(startDateIso, CultureInfo.InvariantCulture).Date;
        var endDate   = DateTime.Parse(endDateIso, CultureInfo.InvariantCulture).Date;

        // Start of day: 00:00:00.000
        var startLocal = DateTime.SpecifyKind(
            startDate,
            DateTimeKind.Unspecified
        );

        // End of day: 23:59:59.9999999
        var endLocal = DateTime.SpecifyKind(
            endDate.AddDays(1).AddTicks(-1),
            DateTimeKind.Unspecified
        );

        var startOffset = new DateTimeOffset(
            startLocal,
            timeZone.GetUtcOffset(startLocal)
        );

        var endOffset = new DateTimeOffset(
            endLocal,
            timeZone.GetUtcOffset(endLocal)
        );

        return (
            startOffset.ToUniversalTime(),
            endOffset.ToUniversalTime()
        );
    }
}
}
