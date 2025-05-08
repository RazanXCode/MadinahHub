using MHBackend.Data;
using Microsoft.EntityFrameworkCore;
using MHBackend.Auth;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using MHBackend.Repositories;
using Microsoft.AspNetCore.Authentication;
using MHBackend.Services;
using System.Text.Json.Serialization;
var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
FirebaseApp.Create(new AppOptions
{
    Credential = GoogleCredential.FromFile("./Secrets/fir-fbe50-firebase-adminsdk-fbsvc-d437111a10.json"),
});


// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();


// Add CORS for Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
    builder => builder
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());

});

// Add Swagger for API documentation
builder.Services.AddSwaggerGen();


// Register Database service
builder.Services.AddDbContext<MyAppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")) // Note: Add your own Connection string in appsettings.json
);

// Add Services
builder.Services.AddSingleton<IQRCodeService, QRCodeService>();
builder.Services.AddScoped<IEmailService, EmailService>();


// Add Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register ISmsService and SmsService
builder.Services.Configure<TwilioSettings>(options => {
    options.AccountSid = "AC60ac9ab1c3f6ec094769a44ac87d227a";
    options.AuthToken = "e09322f9545f5815111070ddeba274c0";
    options.PhoneNumber = "+13367042386";
});
builder.Services.AddScoped<ISmsService, SmsService>();

// Register INotificationService and NotificationService
builder.Services.AddScoped<INotificationService, NotificationService>();

// Add Firebase authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "Firebase";
    options.DefaultChallengeScheme = "Firebase";
})
.AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", null);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "API v1");

    });
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseCors("AllowAngularApp");

app.Run();
