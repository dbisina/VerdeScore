import React, { createContext, useContext, useId, useMemo } from "react"
import { Legend, ResponsiveContainer, Tooltip } from "recharts"
import { twMerge } from "tailwind-merge"

const THEMES = { light: "", dark: ".dark" }

const ChartContext = createContext(null)

function useChart() {
    const context = useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a <Chart />")
    }
    return context
}

export const Chart = React.forwardRef(({
    id,
    className,
    children,
    config,
    ...props
}, ref) => {
    const uniqueId = useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-chart={chartId}
                ref={ref}
                className={twMerge(
                    "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-white [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-white/10 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-white/20 [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-white/10 [&_.recharts-radial-bar-background-sector]:fill-white/5 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-white/5 [&_.recharts-reference-line_[stroke='#ccc']]:stroke-white/10 [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <ResponsiveContainer>{children}</ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
})
Chart.displayName = "Chart"

const ChartStyle = ({ id, config }) => {
    const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color)

    if (!colorConfig.length) {
        return null
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                                .map(([key, itemConfig]) => {
                                    const color = itemConfig.theme?.[theme] || itemConfig.color
                                    return color ? `  --color-${key}: ${color};` : null
                                })
                                .join("\n")}
}
`
                    )
                    .join("\n"),
            }}
        />
    )
}

export const ChartTooltip = Tooltip

export const ChartTooltipContent = React.forwardRef(({
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
}, ref) => {
    const { config } = useChart()

    const tooltipLabel = useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null
        }

        const [item] = payload
        if (!item) return null

        const key = `${labelKey || item.dataKey || item.name || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)
        const value =
            !labelKey && typeof label === "string"
                ? config[label]?.label || label
                : itemConfig?.label

        if (labelFormatter) {
            return <div className={labelClassName}>{labelFormatter(value, payload)}</div>
        }

        if (!value) return null

        return <div className={labelClassName}>{value}</div>
    }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey])

    if (!active || !payload?.length) {
        return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
        <div
            ref={ref}
            className={twMerge(
                "grid min-w-[12rem] items-start gap-1.5 rounded-lg border border-white/10 bg-[#0f172a]/90 px-3 py-2 text-white text-xs shadow-xl backdrop-blur-md",
                className
            )}
        >
            {!nestLabel ? tooltipLabel : null}
            <div className="grid gap-1.5">
                {payload.map((item, index) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`
                    const itemConfig = getPayloadConfigFromPayload(config, item, key)
                    const indicatorColor = color || item.payload.fill || item.color

                    return (
                        <div
                            key={item.dataKey}
                            className={twMerge(
                                "flex w-full flex-wrap items-stretch gap-2 *:data-[slot=icon]:size-2.5 *:data-[slot=icon]:text-gray-400",
                                indicator === "dot" && "items-center"
                            )}
                        >
                            {formatter && item?.value !== undefined && item.name ? (
                                formatter(item.value, item.name, item, index, item.payload)
                            ) : (
                                <>
                                    {itemConfig?.icon ? (
                                        <itemConfig.icon />
                                    ) : (
                                        !hideIndicator && (
                                            <div
                                                className={twMerge(
                                                    "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                                                    indicator === "dot" && "size-2.5",
                                                    indicator === "line" && "w-1",
                                                    indicator === "dashed" &&
                                                    "w-0 border-[1.5px] border-dashed bg-transparent",
                                                    nestLabel && indicator === "dashed" && "my-0.5"
                                                )}
                                                style={{
                                                    "--color-bg": indicatorColor,
                                                    "--color-border": indicatorColor,
                                                }}
                                            />
                                        )
                                    )}
                                    <div
                                        className={twMerge(
                                            "flex flex-1 justify-between leading-none",
                                            nestLabel ? "items-end" : "items-center"
                                        )}
                                    >
                                        <div className="grid gap-1.5">
                                            {nestLabel ? tooltipLabel : null}
                                            <span className="text-gray-400">{itemConfig?.label || item.name}</span>
                                        </div>
                                        {item.value && (
                                            <span className="font-medium font-mono text-white tabular-nums">
                                                {item.value.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export const ChartLegend = Legend

export const ChartLegendContent = React.forwardRef(({
    className,
    hideIcon = false,
    payload,
    verticalAlign = "bottom",
    nameKey,
}, ref) => {
    const { config } = useChart()

    if (!payload?.length) return null

    return (
        <div
            ref={ref}
            className={twMerge(
                "flex items-center justify-center gap-4",
                verticalAlign === "top" ? "pb-3" : "pt-3",
                className
            )}
        >
            {payload.map((item) => {
                const key = `${nameKey || item.dataKey || "value"}`
                const itemConfig = getPayloadConfigFromPayload(config, item, key)

                return (
                    <div
                        key={item.value}
                        className="flex items-center gap-1.5 *:data-[slot=icon]:size-3 *:data-[slot=icon]:text-gray-400"
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        )}
                        <span className="text-gray-300">{itemConfig?.label}</span>
                    </div>
                )
            })}
        </div>
    )
})
ChartLegendContent.displayName = "ChartLegendContent"

function getPayloadConfigFromPayload(config, payload, key) {
    if (typeof payload !== "object" || payload === null) {
        return undefined
    }

    const payloadPayload =
        "payload" in payload && typeof payload.payload === "object" && payload.payload !== null
            ? payload.payload
            : undefined

    let configLabelKey = key

    if (key in payload && typeof payload[key] === "string") {
        configLabelKey = payload[key]
    } else if (
        payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key] === "string"
    ) {
        configLabelKey = payloadPayload[key]
    }

    return configLabelKey in config ? config[configLabelKey] : config[key]
}
