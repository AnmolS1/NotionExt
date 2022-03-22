set theString to null
tell application "Calendar"
    set names to get name of calendars
    repeat with calName in names
        tell calendar calName
            try
                set foundEvent to (first event where its summary = "${event_name}")

                set desc to description of foundEvent
                set allday to allday event of foundEvent
                set startDate to start date of foundEvent
                set endDate to end date of foundEvent
                set recur to recurrence of foundEvent
                set locale to location of foundEvent

                set theList to {desc, allday, startDate, endDate, recur, locale}
                set AppleScript's text item delimiters to " | "
                set theString to theList as string
                exit repeat
            on error line number num
            end try
        end tell
    end repeat
end tell
return theString