using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace csi_mkd_premarital_app_BE.Models
{
    [JsonConverter(typeof(TimeZoneOptionJsonConverter))]
    public enum TimeZoneOption
    {
        [Description("Asia/Kolkata")]
        Asia_Kolkata,

        [Description("Asia/Dubai")]
        Asia_Dubai,

        [Description("Asia/Kuwait")]
        Asia_Kuwait,

        [Description("Asia/Muscat")]
        Asia_Muscat,

        [Description("Asia/Qatar")]
        Asia_Qatar,

        [Description("Asia/Bahrain")]
        Asia_Bahrain,

        [Description("Asia/Singapore")]
        Asia_Singapore,

        [Description("Australia/Brisbane")]
        Australia_Brisbane,

        [Description("Europe/London")]
        Europe_London,

        [Description("Europe/Dublin")]
        Europe_Dublin,

        [Description("America/New_York")]
        America_New_York,

        [Description("America/Toronto")]
        America_Toronto,

        [Description("America/Chicago")]
        America_Chicago,

        [Description("America/Detroit")]
        America_Detroit,

        [Description("America/Los_Angeles")]
        America_Los_Angeles,

        [Description("UTC")]
        UTC
    }

    public static class TimeZoneOptionExtensions
    {
        public static string GetIanaId(this TimeZoneOption option)
        {
            var field = option.GetType().GetField(option.ToString());
            var attribute = field?.GetCustomAttributes(typeof(DescriptionAttribute), false) as DescriptionAttribute[];
            return attribute?.Length > 0 ? attribute[0].Description : option.ToString();
        }

        public static TimeZoneOption FromIanaId(string id)
        {
            foreach (var field in typeof(TimeZoneOption).GetFields())
            {
                var attribute = field.GetCustomAttributes(typeof(DescriptionAttribute), false) as DescriptionAttribute[];
                if (attribute?.Length > 0 && attribute[0].Description == id)
                {
                    return (TimeZoneOption)field.GetValue(null)!;
                }
            }
            throw new ArgumentException($"Invalid TimeZone ID: {id}");
        }
    }

    public class TimeZoneOptionJsonConverter : JsonConverter<TimeZoneOption>
    {
        public override TimeZoneOption Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var str = reader.GetString();
            if (string.IsNullOrEmpty(str)) throw new JsonException("TimeZone string cannot be null or empty");
            try
            {
                return TimeZoneOptionExtensions.FromIanaId(str);
            }
            catch (ArgumentException)
            {
                throw new JsonException($"Invalid TimeZone value: {str}");
            }
        }

        public override void Write(Utf8JsonWriter writer, TimeZoneOption value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.GetIanaId());
        }
    }
}
