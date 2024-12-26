import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from 'hono/jwt'
import { signinInput, signupInput } from "tanishqkumar-medium-common";
import { Resend } from "resend";


export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();


userRouter.post("/signup", async (c) => {
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Invalid Inputs"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const existingUser = await prisma.user.findUnique({
        where: {
            username: body.username
        }
    })
    if (existingUser) {
        return c.json({ error: "Email already exists" });
    }

    try {
        const user = await prisma.user.create({
            data: {
                username: body.username,
                password: body.password,
                name: body.name
            }
        });

        // Email function
        const resend = new Resend('your api');
        const receiver = body.username;

        try {
            const data = await resend.emails.send({
                from: 'ThoughtSphere@webmaven.tech',
                to: receiver,
                subject: '🎉 Account Created Successfully!',
                html: `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <h2 style="color: #4CAF50;">Welcome to ThoughtSphere! 🎉</h2>
    <p><b>Name:</b> ${body.name}</p>
    <p><b>Account Created At:</b> ${new Date().toLocaleString()}</p>
    <hr />
    <p style="font-size: 0.9em; color: #555;">Thank you for signing up with us! We’re thrilled to have you on board and look forward to supporting your journey.</p>
    <p style="font-size: 0.9em; color: #555;">If you have any questions, feel free to <a href="mailto:ThoughtSphere@webmaven.tech" style="color: #4CAF50;">contact us</a>.</p>
    <p style="font-size: 0.9em; color: #555;">Visit your dashboard to explore all the features: <a href="https://thoughtsphere-6b5e7.web.app/" style="color: #4CAF50;">Go to Dashboard</a>.</p>
  </div>
`

            });
            console.log(data);
        } catch (emailError) {
            console.error("Error sending email:", emailError);
        }

        const payload = {
            id: user.id,
        };
        const token = await sign(payload, c.env.JWT_SECRET);

        return c.json({
            msg: "User successfully created",
            token,
            payload,
            user
        });
    } catch (e: any) {
        if (e.code === 'P2002') {
            c.status(409); // Conflict, unique constraint violation
            return c.json({ error: "Email already exists" });
        }
        console.error("Error details:", e); // Log error for more info
        c.status(403);
        // c.json({e})
        return c.json({
            error: "error while signing",
            e
        });
    }

});


userRouter.post("/signin", async (c) => {
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
        c.status(411);
        return c.json({
            message: "Invalid Inputs"
        })
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: body.username
            }
        })

        if (!user) {
            c.status(411);
            return c.json({
                message: "User not found"
            })
        }

        const payload = {
            id: user.id
            // exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
        }
        const token = await sign(payload, c.env.JWT_SECRET)

        return c.json({
            msg: "User logged in successfully",
            token,
            payload,
            user
        });
    } catch (e) {
        c.status(403);
        return c.json({ error: "error while signing up" });
    }
});
